import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'
import { App, Concept, Lecture } from '@/lib/firebase/types'

interface StoredApp extends Omit<App, 'created_at' | 'updated_at'> {
  created_at: string
  updated_at: string
}

interface StoredConcept extends Omit<Concept, 'created_at' | 'updated_at'> {
  created_at: string
  updated_at: string
}

interface StoredExamContent {
  app: StoredApp
  concepts: StoredConcept[]
}

interface LoadedExamContent {
  app: App
  concepts: Concept[]
}

const EXAMS_DIR = path.join(process.cwd(), 'data', 'exams')

function toDate(value: string | Date | undefined): Date {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date() : value
  }

  if (!value) {
    return new Date()
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function normalizeApp(app: StoredApp): App {
  return {
    ...app,
    created_at: toDate(app.created_at),
    updated_at: toDate(app.updated_at),
  }
}

function normalizeConcept(concept: StoredConcept): Concept {
  return {
    ...concept,
    created_at: toDate(concept.created_at),
    updated_at: toDate(concept.updated_at),
  }
}

function sortApps<T extends App>(apps: T[]): T[] {
  return [...apps].sort((left, right) => {
    const featuredDelta = Number(Boolean(right.is_featured)) - Number(Boolean(left.is_featured))
    if (featuredDelta !== 0) {
      return featuredDelta
    }

    return right.updated_at.getTime() - left.updated_at.getTime()
  })
}

function sortConcepts(concepts: Concept[]): Concept[] {
  return [...concepts].sort((left, right) => {
    const importanceDelta = right.importance - left.importance
    if (importanceDelta !== 0) {
      return importanceDelta
    }

    return right.updated_at.getTime() - left.updated_at.getTime()
  })
}

const loadExamContent = cache(async (): Promise<LoadedExamContent[]> => {
  let fileNames: string[] = []

  try {
    fileNames = (await fs.readdir(EXAMS_DIR))
      .filter((fileName) => fileName.endsWith('.json'))
      .sort()
  } catch {
    return []
  }

  const files = await Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = path.join(EXAMS_DIR, fileName)
      const raw = await fs.readFile(filePath, 'utf8')
      return JSON.parse(raw) as StoredExamContent
    })
  )

  return files.map((file) => ({
    app: normalizeApp(file.app),
    concepts: sortConcepts(file.concepts.map(normalizeConcept)),
  }))
})

export async function getApps(): Promise<App[]> {
  const exams = await loadExamContent()
  return sortApps(
    exams
      .map((exam) => exam.app)
      .filter((app) => app.status === 'published')
  )
}

export async function getFeaturedApps(): Promise<App[]> {
  const apps = await getApps()
  return apps.filter((app) => app.is_featured).slice(0, 3)
}

export async function getAppByBundleId(bundleId: string): Promise<App | null> {
  const apps = await getApps()
  return apps.find((app) => app.bundle_id === bundleId) || null
}

export async function getAllApps(): Promise<App[]> {
  const exams = await loadExamContent()
  return sortApps(exams.map((exam) => exam.app))
}

export async function getConceptsByAppId(appId: string): Promise<Concept[]> {
  const exams = await loadExamContent()
  const exam = exams.find((entry) => entry.app.bundle_id === appId)
  return exam ? [...exam.concepts] : []
}

export async function getConceptsByCategory(appId: string, category: string): Promise<Concept[]> {
  const concepts = await getConceptsByAppId(appId)
  return concepts.filter((concept) => concept.category === category)
}

export async function getLecturesByAppId(_appId: string): Promise<Lecture[]> {
  return []
}

export async function getLecturesByCategory(_appId: string, _category: string): Promise<Lecture[]> {
  return []
}

export async function getAllConcepts(): Promise<(Concept & { app_name: string })[]> {
  const exams = await loadExamContent()
  return exams
    .flatMap(({ app, concepts }) =>
      concepts.map((concept) => ({
        ...concept,
        app_name: app.app_name,
      }))
    )
    .sort((left, right) => right.updated_at.getTime() - left.updated_at.getTime())
}

export async function getAllLectures(): Promise<(Lecture & { app_name: string })[]> {
  return []
}

export async function getAppsWithContentCounts(): Promise<(App & { conceptCount: number; lectureCount: number })[]> {
  const exams = await loadExamContent()
  return sortApps(
    exams
      .filter(({ app }) => app.status === 'published')
      .map(({ app, concepts }) => ({
        ...app,
        conceptCount: concepts.length,
        lectureCount: 0,
      }))
  )
}

export async function incrementDownloadCount(_bundleId: string): Promise<void> {
  return
}
