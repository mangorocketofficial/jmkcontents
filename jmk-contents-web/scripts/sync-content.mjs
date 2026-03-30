import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'

const repoUrl = 'https://github.com/mangorocketofficial/exam-pipeline-generator.git'

const sources = [
  {
    id: 'hansigjorigineungsa',
    branch: 'data/hansigjorigineungsa',
    dbPath: 'database/concepts.db',
    app: {
      bundle_id: 'hansigjorigineungsa',
      app_name: '한식조리기능사',
      app_name_full: '원펀: 한식조리기능사 필기 기출문제',
      description: '한식조리기능사 필기 시험 대비를 위한 기출문제 학습 앱입니다. 최신 기출문제 20세트, 음성듣기, 상세 해설, 오답노트 기능으로 효율적으로 준비하세요.',
      description_full: `한식조리기능사 자격증 합격? 이 앱 하나면 끝!

주요 기능
- 최신 기출문제 20세트
- 연도별, 과목별 기출문제 풀기
- 기출문제 음성듣기
- 랜덤 문제 풀기
- 모든 문제 해설 제공
- 오답노트: 틀린 문제만 자동 저장
- 즐겨찾기 기능: 내가 찜한 문제를 다시 복습
- Wifi, 인터넷 없이도 사용 가능
- 완전 무료

지하철 및 이동 중에도 언제 어디서나 간편하게 기출문제를 풀고 실력을 완성하세요. 이 앱 하나면 한식조리기능사 자격증 준비를 효율적으로 할 수 있습니다.

Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacy Policy: https://jmkcontents.com/privacy`,
      app_category: '기능사',
      status: 'published',
      is_featured: false,
      rating: 0,
      review_count: 0,
      download_count: 0,
      icon_url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/60/34/5e/60345e56-2ec6-ee3b-9255-6679803c90c7/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg',
      app_store_url: 'https://apps.apple.com/app/%EC%9B%90%ED%8E%80-%ED%95%9C%EC%8B%9D%EC%A1%B0%EB%A6%AC%EA%B8%B0%EB%8A%A5%EC%82%AC-%ED%95%84%EA%B8%B0-%EA%B8%B0%EC%B6%9C%EB%AC%B8%EC%A0%9C/id6761005380',
    },
  },
  {
    id: 'comactiv1',
    branch: 'comactiv1_pipeline',
    dbPath: 'output/comactiv1_pipeline/database/concepts.db',
    app: {
      bundle_id: 'comactiv1',
      app_name: '컴활 1급',
      app_name_full: '컴퓨터활용능력 1급',
      description: '컴퓨터활용능력 1급 필기 핵심개념을 과목별로 빠르게 복습할 수 있도록 정리했습니다.',
      description_full: '컴퓨터활용능력 1급 필기 시험의 핵심개념을 DB 원본 기준으로 정리한 학습 자료입니다. 데이터베이스 일반, 스프레드시트 일반, 컴퓨터 일반 과목을 빠르게 훑고 시험 직전에 복습할 수 있도록 구성했습니다.',
      app_category: '컴퓨터자격증',
      status: 'published',
      is_featured: false,
      rating: 0,
      review_count: 0,
      download_count: 0,
    },
  },
  {
    id: 'comactiv2',
    branch: 'comactiv2_pipeline',
    dbPath: 'output/comactiv2_pipeline/database/concepts.db',
    app: {
      bundle_id: 'comactiv2',
      app_name: '컴활 2급',
      app_name_full: '컴퓨터활용능력 2급',
      description: '컴퓨터활용능력 2급 필기 핵심개념을 과목별로 빠르게 복습할 수 있도록 정리했습니다.',
      description_full: '컴퓨터활용능력 2급 필기 시험의 핵심개념을 DB 원본 기준으로 정리한 학습 자료입니다. 과목별 개념을 빠르게 훑고 시험 직전에 복습할 수 있도록 구성했습니다.',
      app_category: '컴퓨터자격증',
      status: 'published',
      is_featured: true,
      rating: 0,
      review_count: 0,
      download_count: 0,
    },
  },
]

function run(command, args, options = {}) {
  const result = execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  })

  return typeof result === 'string' ? result.trim() : ''
}

function normalizeTimestamp(value) {
  if (!value) {
    return new Date().toISOString()
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.replace(' ', 'T') + 'Z'
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

function getTableColumns(dbFilePath, tableName) {
  const raw = run('sqlite3', ['-json', dbFilePath, `PRAGMA table_info(${tableName});`])
  const rows = raw ? JSON.parse(raw) : []

  return new Set(
    rows
      .map((row) => (typeof row.name === 'string' ? row.name : ''))
      .filter(Boolean)
  )
}

function tableExists(dbFilePath, tableName) {
  const raw = run(
    'sqlite3',
    ['-json', dbFilePath, `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${tableName}';`]
  )
  const rows = raw ? JSON.parse(raw) : []
  return rows.length > 0
}

function buildSelectExpression(columns, candidates, alias, fallback = 'NULL') {
  const columnName = candidates.find((candidate) => columns.has(candidate))
  return columnName ? `${columnName} AS ${alias}` : `${fallback} AS ${alias}`
}

function clampImportance(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return 3
  }
  return Math.min(5, Math.max(1, Math.round(numeric)))
}

function buildKeywords(row) {
  const rawKeywords = typeof row.keywords === 'string' ? row.keywords.trim() : ''
  if (rawKeywords) {
    if (rawKeywords.startsWith('[') && rawKeywords.endsWith(']')) {
      try {
        const parsed = JSON.parse(rawKeywords)
        if (Array.isArray(parsed)) {
          return parsed
            .map((value) => (typeof value === 'string' ? value.trim() : ''))
            .filter(Boolean)
            .join(', ')
        }
      } catch {
        // Fall through to the raw string if it is not valid JSON.
      }
    }

    return rawKeywords
  }

  return [row.title, row.category]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .join(', ')
}

function buildAppPayload(source, concepts) {
  const categories = Array.from(new Set(concepts.map((concept) => concept.category).filter(Boolean)))
  const createdAtValues = concepts.map((concept) => concept.created_at).sort()
  const updatedAtValues = concepts.map((concept) => concept.updated_at).sort()

  return {
    ...source.app,
    categories,
    marketing_url: `https://jmkcontents.com/exams/${source.app.bundle_id}`,
    created_at: createdAtValues[0] || new Date().toISOString(),
    updated_at: updatedAtValues.at(-1) || new Date().toISOString(),
  }
}

function loadRelatedQuestionIds(dbFilePath) {
  if (!tableExists(dbFilePath, 'concept_questions')) {
    return new Map()
  }

  const columns = getTableColumns(dbFilePath, 'concept_questions')
  if (!columns.has('concept_id') || !columns.has('question_id')) {
    return new Map()
  }

  const query = [
    'SELECT',
    '  concept_id AS source_id,',
    "  GROUP_CONCAT(question_id, ',') AS question_ids",
    'FROM concept_questions',
    'GROUP BY concept_id',
    'ORDER BY concept_id ASC;',
  ].join(' ')

  const raw = run('sqlite3', ['-json', dbFilePath, query])
  const rows = raw ? JSON.parse(raw) : []
  const relatedQuestionIdsByConcept = new Map()

  for (const row of rows) {
    const questionIds = typeof row.question_ids === 'string'
      ? row.question_ids.split(',').map((value) => value.trim()).filter(Boolean)
      : []

    relatedQuestionIdsByConcept.set(Number(row.source_id), questionIds)
  }

  return relatedQuestionIdsByConcept
}

function getRepoTimestamp(repoRoot) {
  const timestamp = run('git', ['log', '-1', '--format=%cI'], { cwd: repoRoot })
  return normalizeTimestamp(timestamp)
}

function loadConcepts(dbFilePath, appId, fallbackTimestamp) {
  const columns = getTableColumns(dbFilePath, 'concepts')
  const query = [
    'SELECT',
    `  ${buildSelectExpression(columns, ['concept_id', 'id'], 'source_id')},`,
    `  ${buildSelectExpression(columns, ['term', 'title'], 'title', "''")},`,
    `  ${buildSelectExpression(columns, ['definition', 'description'], 'content', "''")},`,
    `  ${buildSelectExpression(columns, ['category'], 'category', "''")},`,
    `  ${buildSelectExpression(columns, ['importance'], 'importance', '3')},`,
    `  ${buildSelectExpression(columns, ['keywords'], 'keywords', "''")},`,
    `  ${buildSelectExpression(columns, ['study_note', 'study_notes'], 'study_note', "''")},`,
    `  ${buildSelectExpression(columns, ['created_at'], 'created_at')},`,
    `  ${buildSelectExpression(columns, ['updated_at'], 'updated_at')}`,
    'FROM concepts',
    'ORDER BY importance DESC, category ASC, source_id ASC;',
  ].join(' ')

  const raw = run('sqlite3', ['-json', dbFilePath, query])
  const rows = raw ? JSON.parse(raw) : []
  const relatedQuestionIdsByConcept = loadRelatedQuestionIds(dbFilePath)

  return rows.map((row) => ({
    id: `${appId}_${row.source_id}`,
    app_id: appId,
    category: typeof row.category === 'string' ? row.category.trim() : '',
    title: typeof row.title === 'string' ? row.title.trim() : `개념 ${row.source_id}`,
    content: typeof row.content === 'string' ? row.content.trim() : '',
    importance: clampImportance(row.importance),
    keywords: buildKeywords(row),
    study_note: typeof row.study_note === 'string' ? row.study_note.trim() : '',
    related_question_ids: relatedQuestionIdsByConcept.get(Number(row.source_id)) || [],
    created_at: normalizeTimestamp(row.created_at || fallbackTimestamp),
    updated_at: normalizeTimestamp(row.updated_at || fallbackTimestamp),
  }))
}

function syncSource(source, repoRoot, outputDir) {
  const dbFilePath = path.join(repoRoot, source.dbPath)
  const repoTimestamp = getRepoTimestamp(repoRoot)
  const concepts = loadConcepts(dbFilePath, source.app.bundle_id, repoTimestamp)
  const payload = {
    source: {
      repo_url: repoUrl,
      branch: source.branch,
      db_path: source.dbPath,
      generated_at: new Date().toISOString(),
      concept_count: concepts.length,
      note: 'App metadata is normalized in this repository because the upstream branch currently has mismatched app config values.',
    },
    app: buildAppPayload(source, concepts),
    concepts,
  }

  const outputFilePath = path.join(outputDir, `${source.id}.json`)
  writeFileSync(outputFilePath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  console.log(`Wrote ${outputFilePath} (${concepts.length} concepts)`)
}

function main() {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'exam-pipeline-generator-'))
  const outputDir = path.join(process.cwd(), 'data', 'exams')

  mkdirSync(outputDir, { recursive: true })

  try {
    for (const source of sources) {
      const sourceRepoRoot = path.join(tempDir, source.id)
      console.log(`Cloning ${repoUrl}#${source.branch}...`)
      run('git', ['clone', '--depth', '1', '--branch', source.branch, repoUrl, sourceRepoRoot], {
        stdio: 'inherit',
      })

      syncSource(source, sourceRepoRoot, outputDir)
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

main()
