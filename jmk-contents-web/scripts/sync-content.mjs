import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'

const repoUrl = 'https://github.com/mangorocketofficial/exam-pipeline-generator.git'

const sources = [
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

  return [row.term, row.category]
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
  const query = [
    'SELECT',
    '  concept_id,',
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

    relatedQuestionIdsByConcept.set(Number(row.concept_id), questionIds)
  }

  return relatedQuestionIdsByConcept
}

function loadConcepts(dbFilePath, appId) {
  const query = [
    'SELECT',
    '  concept_id,',
    '  term,',
    '  definition,',
    '  category,',
    '  importance,',
    "  COALESCE(keywords, '') AS keywords,",
    "  COALESCE(study_note, '') AS study_note,",
    '  created_at,',
    '  updated_at',
    'FROM concepts',
    'ORDER BY importance DESC, category ASC, concept_id ASC;',
  ].join(' ')

  const raw = run('sqlite3', ['-json', dbFilePath, query])
  const rows = raw ? JSON.parse(raw) : []
  const relatedQuestionIdsByConcept = loadRelatedQuestionIds(dbFilePath)

  return rows.map((row) => ({
    id: `${appId}_${row.concept_id}`,
    app_id: appId,
    category: typeof row.category === 'string' ? row.category.trim() : '',
    title: typeof row.term === 'string' ? row.term.trim() : `개념 ${row.concept_id}`,
    content: typeof row.definition === 'string' ? row.definition.trim() : '',
    importance: clampImportance(row.importance),
    keywords: buildKeywords(row),
    study_note: typeof row.study_note === 'string' ? row.study_note.trim() : '',
    related_question_ids: relatedQuestionIdsByConcept.get(Number(row.concept_id)) || [],
    created_at: normalizeTimestamp(row.created_at),
    updated_at: normalizeTimestamp(row.updated_at),
  }))
}

function syncSource(source, repoRoot, outputDir) {
  const dbFilePath = path.join(repoRoot, source.dbPath)
  const concepts = loadConcepts(dbFilePath, source.app.bundle_id)
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
    console.log(`Cloning ${repoUrl}...`)
    run('git', ['clone', '--depth', '1', '--branch', sources[0].branch, repoUrl, tempDir], {
      stdio: 'inherit',
    })

    for (const source of sources) {
      const sourceRepoRoot = source.branch === sources[0].branch
        ? tempDir
        : path.join(tempDir, source.branch)

      if (source.branch !== sources[0].branch) {
        run('git', ['clone', '--depth', '1', '--branch', source.branch, repoUrl, sourceRepoRoot], {
          stdio: 'inherit',
        })
      }

      syncSource(source, sourceRepoRoot, outputDir)
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

main()
