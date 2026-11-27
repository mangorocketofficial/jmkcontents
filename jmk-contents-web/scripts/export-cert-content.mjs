// cert-apps 콘텐츠 DB에서 사이트에 올릴 데이터를 뽑아 data/cert/<slug>.json으로 쓴다.
//
//   node scripts/export-cert-content.mjs <cert-apps 체크아웃 경로> [종목 id ...]
//
// 종목 id(forklift, hansik 등)를 주면 그 종목만 다시 만든다.
//
// 올리는 것: 자체 제작 예상문제(source = 'expected') 중 검수 상태가 ok인 문항과 그 해설.
// 올리지 않는 것: 기출 원문(source = 'past'), 법령 대조가 안 끝난 문항(law_pending),
// 정답이 의심되는 문항(suspect), 그림이 있는 문항.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const QNET = { name: '한국산업인력공단 Q-Net', url: 'https://www.q-net.or.kr' }
const KORCHAM = { name: '대한상공회의소 자격평가사업단', url: 'https://license.korcham.net' }

// slug는 사이트 주소(/exams/<slug>)다. 한 번 정하면 바꾸지 않는다.
// existing: 사이트(Firestore)에 이미 있는 종목(참고용 표시). icon: 9.2 앱의 App Store 아이콘.
const CERTS = [
  { cert: 'forklift', slug: 'jigechaunjeongineungsa', name: '지게차운전기능사', category: '기능사', authority: QNET, existing: true,
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/8e/e8/f3/8ee8f32c-e1db-95bd-0653-06369648b17e/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  { cert: 'excavator', slug: 'gulchakgiunjeongineungsa', name: '굴착기운전기능사', category: '기능사', authority: QNET,
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/23/e0/15/23e0157f-3bbb-87b7-50b5-5a52e3629033/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  { cert: 'hair', slug: 'miyongsa-ilban', name: '미용사(일반)', category: '기능사', authority: QNET,
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ff/d5/e8/ffd5e8a0-161a-f1d2-d4ae-2e13eb8a04ab/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  // 사이트의 기존 '미용사' 종목(miyongsa)은 네일 콘텐츠다(핵심개념이 네일 개론·네일미용 기술).
  { cert: 'nail', slug: 'miyongsa', name: '미용사(네일)', category: '기능사', authority: QNET, existing: true,
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/91/b1/7a/91b17ad5-7e31-d480-a7b3-70458a85fc9f/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  { cert: 'skin', slug: 'miyongsa-pibu', name: '미용사(피부)', category: '기능사', authority: QNET,
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2a/31/25/2a312543-5937-90d3-bc3a-f4994e99e7c0/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  { cert: 'makeup', slug: 'miyongsa-makeup', name: '미용사(메이크업)', category: '기능사', authority: QNET,
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/8c/d7/13/8cd7134d-7630-a194-b9c9-97625bb95a6c/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  { cert: 'safety_eng', slug: 'saneobanjeongisa', name: '산업안전기사', category: '기사', authority: QNET,
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c4/92/8b/c4928b96-b50b-e924-500c-4a4d5a453e61/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  { cert: 'safety_ind', slug: 'saneobanjeonsaneobgisa', name: '산업안전산업기사', category: '산업기사', authority: QNET, existing: true,
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/39/2c/ff/392cff1b-4cd8-e973-1223-984a39476a9e/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  { cert: 'hansik', slug: 'hansigjorigineungsa', name: '한식조리기능사', category: '기능사', authority: QNET, existing: true,
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0f/16/a5/0f16a5a2-46d3-7c06-32e4-cd8e81f9dc8d/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
  { cert: 'yangsik', slug: 'yangsigjorigineungsa', name: '양식조리기능사', category: '기능사', storePending: true, includeReviewMaterials: true,
    authority: { ...QNET, url: 'https://www.q-net.or.kr/crf005.do?id=crf00503s02&jmCd=7911' } },
  { cert: 'comp1', slug: 'comactiv1', name: '컴퓨터활용능력 1급', category: '컴퓨터자격증', authority: KORCHAM, existing: true,
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b3/63/69/b36369da-8292-9762-1805-088edf3081e5/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg' },
]

const certAppsDir = process.argv[2]
if (!certAppsDir || !existsSync(path.join(certAppsDir, 'apps'))) {
  console.error('사용법: node scripts/export-cert-content.mjs <cert-apps 체크아웃 경로> [종목 id ...]')
  process.exit(1)
}

function query(dbPath, sql) {
  const out = execFileSync('sqlite3', ['-json', dbPath, sql], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
  return out.trim() ? JSON.parse(out) : []
}

function configValue(config, key) {
  const match = config.match(new RegExp(`^\\s*${key}:\\s*"?([^"#\\n]+?)"?\\s*(#.*)?$`, 'm'))
  return match ? match[1].trim() : ''
}

const only = process.argv.slice(3)
const unknown = only.filter((id) => !CERTS.some((entry) => entry.cert === id))
if (unknown.length > 0) {
  console.error(`모르는 종목 id: ${unknown.join(', ')}`)
  process.exit(1)
}

const outDir = path.join(process.cwd(), 'data', 'cert')
const examsDir = path.join(process.cwd(), 'data', 'exams')
mkdirSync(outDir, { recursive: true })

for (const entry of CERTS) {
  if (only.length > 0 && !only.includes(entry.cert)) continue
  const appDir = path.join(certAppsDir, 'apps', entry.cert)
  const dbPath = path.join(appDir, 'content.db')
  const config = readFileSync(path.join(appDir, 'config.yaml'), 'utf8')
  const appStoreId = entry.storePending ? '' : configValue(config, 'app_store_id').replace(/^'|'$/g, '')

  const units = query(dbPath, 'SELECT id, parent_id, subject, name, weight FROM units ORDER BY sort_order, id')
  const questions = query(dbPath, `
    SELECT q.id, q.unit_id, q.difficulty, q.stem,
           e.answer_basis, e.wrong_reasons, e.memory_point
    FROM questions q
    LEFT JOIN explanations e ON e.question_id = q.id
    WHERE q.source = 'expected' AND q.review_status = 'ok' AND q.unit_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM media m WHERE m.question_id = q.id)
      AND NOT EXISTS (SELECT 1 FROM choices c WHERE c.question_id = q.id
                      AND (c.image_path IS NOT NULL OR c.body IS NULL))
    ORDER BY q.unit_id, q.id`)
  const choices = query(dbPath, `
    SELECT c.question_id, c.number, c.body, c.is_correct
    FROM choices c JOIN questions q ON q.id = c.question_id
    WHERE q.source = 'expected' AND q.review_status = 'ok'
    ORDER BY c.question_id, c.number`)

  const choicesByQuestion = new Map()
  for (const choice of choices) {
    if (!choicesByQuestion.has(choice.question_id)) choicesByQuestion.set(choice.question_id, [])
    choicesByQuestion.get(choice.question_id).push(choice)
  }

  const unitById = new Map(units.map((unit) => [unit.id, unit]))
  const topUnits = units.filter((unit) => !unit.parent_id)
  const exported = topUnits.map((unit) => ({
    id: unit.id,
    name: unit.name,
    subject: unit.subject || '',
    weight: unit.weight || 0,
    subunits: units.filter((sub) => sub.parent_id === unit.id).map((sub) => ({ id: sub.id, name: sub.name })),
    questions: [],
  }))
  const exportedById = new Map(exported.map((unit) => [unit.id, unit]))

  let skipped = 0
  for (const question of questions) {
    const unit = unitById.get(question.unit_id)
    const top = unit && exportedById.get(unit.parent_id || unit.id)
    const list = choicesByQuestion.get(question.id) || []
    const correct = list.filter((choice) => choice.is_correct)
    if (!top || list.length < 2 || correct.length !== 1) {
      skipped += 1
      continue
    }
    top.questions.push({
      id: question.id,
      unit_id: question.unit_id,
      difficulty: question.difficulty || 0,
      stem: question.stem,
      choices: list.map((choice) => choice.body),
      answer: correct[0].number,
      basis: question.answer_basis || '',
      wrong: question.wrong_reasons ? JSON.parse(question.wrong_reasons) : {},
      point: question.memory_point || '',
    })
  }

  const withQuestions = exported.filter((unit) => unit.questions.length > 0)
  const questionCount = Number(configValue(config, 'question_count')) || 0
  const weightSum = topUnits.reduce((sum, unit) => sum + (unit.weight || 0), 0)

  const data = {
    slug: entry.slug,
    cert: entry.cert,
    name: entry.name,
    category: entry.category,
    authority: entry.authority,
    exam: {
      question_count: questionCount,
      time_limit_min: Number(configValue(config, 'time_limit_min')) || 0,
      pass_count: Number(configValue(config, 'pass_count')) || 0,
    },
    // 단원 비중의 합이 문항 수와 같을 때만 "단원별 출제 문항 수"로 보여 준다.
    weights_are_question_counts: questionCount > 0 && weightSum === questionCount,
    ios_url: appStoreId ? `https://apps.apple.com/kr/app/id${appStoreId}` : '',
    subjects: [...new Set(topUnits.map((unit) => unit.subject).filter(Boolean))],
    outline: topUnits.map((unit) => ({
      id: unit.id,
      name: unit.name,
      subject: unit.subject || '',
      weight: unit.weight || 0,
    })),
    units: withQuestions,
  }
  if (entry.includeReviewMaterials) {
    data.ox = query(dbPath, 'SELECT id, statement, answer, explanation FROM ox ORDER BY id')
    data.terms = query(dbPath, 'SELECT term, definition FROM terms ORDER BY term')
  }
  writeFileSync(path.join(outDir, `${entry.slug}.json`), `${JSON.stringify(data, null, 1)}\n`)

  const total = withQuestions.reduce((sum, unit) => sum + unit.questions.length, 0)
  console.log(`${entry.slug}: 단원 ${withQuestions.length}개, 문항 ${total}개${skipped ? `, 제외 ${skipped}개` : ''}`)

  // 공개 앱이 없는 동안 종목 목록과 공부방은 필기 콘텐츠 파일만 사용한다.
  if (entry.storePending) continue

  // 종목 기록(data/exams/<slug>.json)의 앱 정보를 9.2 앱 것으로 맞춘다.
  // 이 파일의 값은 Firestore의 같은 종목 기록보다 우선한다(lib/content.ts의 mergeApps).
  // 파일이 이미 있으면 핵심개념 등 나머지는 그대로 두고 앱 정보만 덮어쓴다.
  const examFile = path.join(examsDir, `${entry.slug}.json`)
  const stamp = '2026-11-25T00:00:00.000Z'
  const stored = existsSync(examFile)
    ? JSON.parse(readFileSync(examFile, 'utf8'))
    : {
        app: {
          bundle_id: entry.slug,
          app_category: entry.category,
          status: 'published',
          is_featured: false,
          rating: 0,
          review_count: 0,
          download_count: 0,
          categories: data.subjects.length > 1 ? data.subjects : [],
          marketing_url: `https://jmkcontents.com/exams/${entry.slug}`,
          created_at: stamp,
        },
        concepts: [],
      }
  Object.assign(stored.app, {
    app_name: entry.name,
    app_name_full: `${entry.name} 필기`,
    description: `${entry.name} 필기 시험 대비 예상문제와 해설, 단원별 핵심요약을 정리했습니다.`,
    description_full: [
      `${entry.name} 필기 시험을 예상문제와 해설, 단원별 핵심요약으로 준비할 수 있습니다. 기출 회차별 풀이와 모의고사, 오답노트는 앱에서 쓸 수 있습니다.`,
      '',
      'Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
      'Privacy Policy: https://jmkcontents.com/privacy',
    ].join('\n'),
    icon_url: entry.icon,
    app_store_url: data.ios_url,
    updated_at: stamp,
  })
  writeFileSync(examFile, `${JSON.stringify(stored, null, 2)}\n`)
}
