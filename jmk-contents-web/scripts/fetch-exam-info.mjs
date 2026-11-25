// 한국산업인력공단 공개 API에서 종목별 시험 일정·합격률·응시 방법을 받아
// data/exam-info/<slug>.json으로 쓴다. 사이트는 이 파일만 읽는다(방문 때 API를 부르지 않는다).
//
//   CERT_DATA_API_KEY=<공공데이터포털 인증키> node scripts/fetch-exam-info.mjs [slug ...]
//
// slug를 주면 그 종목만 다시 받는다.
//
// 일정이 바뀌거나 새해 일정이 등록되면 다시 돌려서 커밋한다.
// 컴퓨터활용능력은 대한상공회의소 시험이라 이 API에 없다.
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// slug는 scripts/export-cert-content.mjs와 같다. jmCd는 공단 종목코드, grdCd는 합격률 API의 등급코드.
const CERTS = [
  { slug: 'jigechaunjeongineungsa', name: '지게차운전기능사', jmCd: '7875', grdCd: '40' },
  { slug: 'gulchakgiunjeongineungsa', name: '굴착기운전기능사', jmCd: '7862', grdCd: '40' },
  { slug: 'miyongsa', name: '미용사(일반)', jmCd: '7937', grdCd: '40' },
  { slug: 'miyongsa-nail', name: '미용사(네일)', jmCd: '7957', grdCd: '40' },
  { slug: 'miyongsa-pibu', name: '미용사(피부)', jmCd: '7947', grdCd: '40' },
  { slug: 'miyongsa-makeup', name: '미용사(메이크업)', jmCd: '7967', grdCd: '40' },
  { slug: 'hansigjorigineungsa', name: '한식조리기능사', jmCd: '7910', grdCd: '40' },
  { slug: 'saneobanjeongisa', name: '산업안전기사', jmCd: '1431', grdCd: '30' },
  { slug: 'saneobanjeonsaneobgisa', name: '산업안전산업기사', jmCd: '2381', grdCd: '31' },
]

const SCHEDULE_URL = 'https://apis.data.go.kr/B490007/qualExamSchd/getQualExamSchdList'
// Q-Net API는 https(443)가 막혀 있어 http로만 열린다.
const PASS_RATE_URL = 'http://openapi.q-net.or.kr/api/service/rest/InquiryQualPassRateSVC/getList'
const QUAL_INFO_URL = 'http://openapi.q-net.or.kr/api/service/rest/InquiryInformationTradeNTQSVC/getList'
const PASS_RATE_YEARS = 5

const key = process.env.CERT_DATA_API_KEY
if (!key) {
  console.error('CERT_DATA_API_KEY 환경 변수가 필요합니다.')
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)
const thisYear = Number(today.slice(0, 4))
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function get(url, params) {
  const query = new URLSearchParams({ serviceKey: key, ...params })
  for (let attempt = 1; ; attempt += 1) {
    try {
      const response = await fetch(`${url}?${query}`, { signal: AbortSignal.timeout(60000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.text()
    } catch (error) {
      if (attempt >= 3) throw error
      await sleep(2000 * attempt)
    }
  }
}

function xmlItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) =>
    Object.fromEntries([...match[1].matchAll(/<(\w+)>([\s\S]*?)<\/\1>/g)].map((field) => [field[1], field[2]]))
  )
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·' }
function decode(text) {
  return text.replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (whole, code) => {
    if (code[0] === '#') {
      const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return String.fromCodePoint(point)
    }
    return ENTITIES[code.toLowerCase()] ?? whole
  })
}

// 공단이 주는 HTML 조각을 줄 단위 글로 바꾼다.
function htmlToLines(source) {
  let text = decode(source)
  text = text.replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
  text = text.replace(/<(br|\/p|\/div|\/li|\/tr|\/h\d|\/table)[^>]*>/gi, '\n').replace(/<[^>]+>/g, ' ')
  return decode(text)
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

const date = (raw) => (/^\d{8}$/.test(raw || '') ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6)}` : '')

async function fetchSchedules(jmCd) {
  const rows = []
  for (const year of [thisYear, thisYear + 1]) {
    for (let pageNo = 1; ; pageNo += 1) {
      const body = JSON.parse(
        await get(SCHEDULE_URL, {
          numOfRows: '50', pageNo: String(pageNo), dataFormat: 'json',
          implYy: String(year), qualgbCd: 'T', jmCd,
        })
      )
      if (body.header?.resultCode !== '00') throw new Error(`일정 API: ${body.header?.resultMsg}`)
      const items = body.body?.items || []
      rows.push(...items)
      if (items.length < 50) break
      await sleep(300)
    }
  }

  return rows
    .map((row) => ({
      year: Number(row.implYy),
      round: Number(row.implSeq),
      description: row.description || '',
      written: {
        apply_start: date(row.docRegStartDt), apply_end: date(row.docRegEndDt),
        exam_start: date(row.docExamStartDt), exam_end: date(row.docExamEndDt),
        result: date(row.docPassDt),
      },
      practical: {
        apply_start: date(row.pracRegStartDt), apply_end: date(row.pracRegEndDt),
        exam_start: date(row.pracExamStartDt), exam_end: date(row.pracExamEndDt),
        result: date(row.pracPassDt),
      },
    }))
    .sort((left, right) => left.year - right.year || left.round - right.round)
}

// 등급 전체를 한 번에 받아 두고 종목별로 나눠 쓴다.
const passRateCache = new Map()
async function fetchGradeYear(grdCd, year) {
  const cacheKey = `${grdCd}:${year}`
  if (!passRateCache.has(cacheKey)) {
    const xml = await get(PASS_RATE_URL, { grdCd, baseYY: String(year), numOfRows: '3000' })
    passRateCache.set(cacheKey, xmlItems(xml))
    await sleep(300)
  }
  return passRateCache.get(cacheKey)
}

async function fetchPassRates(cert) {
  const years = []
  for (let year = thisYear; year >= thisYear - PASS_RATE_YEARS; year -= 1) {
    const rows = (await fetchGradeYear(cert.grdCd, year)).filter(
      // 회차 100 이상은 정기·상시 검정이 아닌 별도 시행분이다.
      (row) => row.jmCd === cert.jmCd && Number(row.implSeq) > 0 && Number(row.implSeq) < 100
    )
    if (rows.length === 0) continue

    const sum = (type) => {
      const matched = rows.filter((row) => row.examTypCcd === type)
      const applicants = matched.reduce((total, row) => total + Number(row.recptNoCnt || 0), 0)
      const passed = matched.reduce((total, row) => total + Number(row.examPassCnt || 0), 0)
      return applicants > 0
        ? { applicants, passed, rate: Math.round((passed / applicants) * 1000) / 10, rounds: matched.length }
        : null
    }
    years.push({ year, written: sum('필기'), practical: sum('실기') })
  }
  return years
}

async function fetchQualInfo(jmCd) {
  const items = xmlItems(await get(QUAL_INFO_URL, { jmCd }))
  const method = items.find((item) => item.infogb === '취득방법')
  if (!method) return []

  // "취득방법"에서 시험과목·검정방법·합격기준까지만 쓴다. 뒤쪽 실기 안전 안내 표는 뺀다.
  const lines = htmlToLines(method.contents || '')
  const start = lines.findIndex((line) => /시\s*행\s*처/.test(line))
  const end = lines.findIndex((line) => /작업형 실기시험 기본정보|안전등급/.test(line))
  return lines.slice(start < 0 ? 0 : start, end < 0 ? undefined : end)
}

const outDir = path.join(process.cwd(), 'data', 'exam-info')
mkdirSync(outDir, { recursive: true })

const only = process.argv.slice(2)

for (const cert of CERTS) {
  if (only.length > 0 && !only.includes(cert.slug)) continue
  const [schedules, pass_rates, how_to] = [
    await fetchSchedules(cert.jmCd),
    await fetchPassRates(cert),
    await fetchQualInfo(cert.jmCd),
  ]
  const data = {
    slug: cert.slug,
    name: cert.name,
    jm_cd: cert.jmCd,
    fetched_on: today,
    source: { name: '한국산업인력공단 공개 API (공공데이터포털)', url: 'https://www.q-net.or.kr' },
    schedules,
    pass_rates,
    how_to,
  }
  writeFileSync(path.join(outDir, `${cert.slug}.json`), `${JSON.stringify(data, null, 1)}\n`)
  console.log(
    `${cert.name}: 일정 ${schedules.length}건 (${[...new Set(schedules.map((row) => row.year))].join(', ') || '없음'}), ` +
      `합격률 ${pass_rates.map((row) => row.year).join(', ') || '없음'}, 응시 방법 ${how_to.length}줄`
  )
}
