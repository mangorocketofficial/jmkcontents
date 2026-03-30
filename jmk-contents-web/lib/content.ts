import { cache } from 'react'
import type { App, Concept, Lecture } from './firebase/types'
import * as firebaseContent from './firebase/apps'
import * as localContent from './local-content'

type ConceptWithAppName = Concept & { app_name: string }
type LectureWithAppName = Lecture & { app_name: string }
type AppWithContentCounts = App & { conceptCount: number; lectureCount: number }

interface ContentSnapshotInput {
  firebaseApps: App[]
  localApps: App[]
  firebaseConcepts: ConceptWithAppName[]
  localConcepts: ConceptWithAppName[]
  firebaseLectures: LectureWithAppName[]
  localLectures: LectureWithAppName[]
}

interface ContentSnapshot {
  apps: App[]
  concepts: ConceptWithAppName[]
  lectures: LectureWithAppName[]
}

export function getHomepageExamPreview<T extends Pick<App, 'bundle_id' | 'is_featured'>>(
  exams: T[],
  limit = 3
): T[] {
  const featuredExams = exams.filter((exam) => exam.is_featured)

  if (featuredExams.length >= limit) {
    return featuredExams.slice(0, limit)
  }

  const featuredIds = new Set(featuredExams.map((exam) => exam.bundle_id))
  const remainingExams = exams.filter((exam) => !featuredIds.has(exam.bundle_id))

  return [...featuredExams, ...remainingExams].slice(0, limit)
}

function getEarlierDate(left: Date, right: Date): Date {
  return left.getTime() <= right.getTime() ? left : right
}

function getLaterDate(left: Date, right: Date): Date {
  return left.getTime() >= right.getTime() ? left : right
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

function sortAppConcepts<T extends Concept>(concepts: T[]): T[] {
  return [...concepts].sort((left, right) => {
    const importanceDelta = right.importance - left.importance
    if (importanceDelta !== 0) {
      return importanceDelta
    }

    return right.updated_at.getTime() - left.updated_at.getTime()
  })
}

function sortAllConcepts(concepts: ConceptWithAppName[]): ConceptWithAppName[] {
  return [...concepts].sort((left, right) => right.updated_at.getTime() - left.updated_at.getTime())
}

function sortLectures<T extends Lecture>(lectures: T[]): T[] {
  return [...lectures].sort((left, right) => right.updated_at.getTime() - left.updated_at.getTime())
}

function mergeAppRecord(existing: App, incoming: App): App {
  return {
    ...existing,
    ...incoming,
    categories: incoming.categories && incoming.categories.length > 0
      ? incoming.categories
      : existing.categories,
    lectures: incoming.lectures && incoming.lectures.length > 0
      ? incoming.lectures
      : existing.lectures,
    is_featured: Boolean(existing.is_featured || incoming.is_featured),
    created_at: getEarlierDate(existing.created_at, incoming.created_at),
    updated_at: getLaterDate(existing.updated_at, incoming.updated_at),
  }
}

function mergeApps(apps: App[]): App[] {
  const mergedApps = new Map<string, App>()

  for (const app of apps) {
    const existing = mergedApps.get(app.bundle_id)
    if (!existing) {
      mergedApps.set(app.bundle_id, app)
      continue
    }

    mergedApps.set(app.bundle_id, mergeAppRecord(existing, app))
  }

  return sortApps([...mergedApps.values()])
}

function mergeConcepts(
  concepts: ConceptWithAppName[],
  appNameMap: Map<string, string>
): ConceptWithAppName[] {
  const mergedConcepts = new Map<string, ConceptWithAppName>()

  for (const concept of concepts) {
    const key = `${concept.app_id}:${concept.id}`
    const normalized = {
      ...concept,
      app_name: appNameMap.get(concept.app_id) || concept.app_name,
    }
    const existing = mergedConcepts.get(key)

    if (!existing || normalized.updated_at.getTime() >= existing.updated_at.getTime()) {
      mergedConcepts.set(key, normalized)
    }
  }

  return sortAllConcepts([...mergedConcepts.values()])
}

function mergeLectures(
  lectures: LectureWithAppName[],
  appNameMap: Map<string, string>
): LectureWithAppName[] {
  const mergedLectures = new Map<string, LectureWithAppName>()

  for (const lecture of lectures) {
    const key = `${lecture.app_id}:${lecture.id}`
    const normalized = {
      ...lecture,
      app_name: appNameMap.get(lecture.app_id) || lecture.app_name,
    }
    const existing = mergedLectures.get(key)

    if (!existing || normalized.updated_at.getTime() >= existing.updated_at.getTime()) {
      mergedLectures.set(key, normalized)
    }
  }

  return sortLectures([...mergedLectures.values()])
}

export function buildContentSnapshot(input: ContentSnapshotInput): ContentSnapshot {
  const apps = mergeApps([
    ...input.firebaseApps,
    ...input.localApps,
  ])
  const publishedAppIds = new Set(apps.map((app) => app.bundle_id))
  const appNameMap = new Map(apps.map((app) => [app.bundle_id, app.app_name]))

  const concepts = mergeConcepts(
    [...input.firebaseConcepts, ...input.localConcepts]
      .filter((concept) => publishedAppIds.has(concept.app_id)),
    appNameMap
  )

  const lectures = mergeLectures(
    [...input.firebaseLectures, ...input.localLectures]
      .filter((lecture) => publishedAppIds.has(lecture.app_id)),
    appNameMap
  )

  return {
    apps,
    concepts,
    lectures,
  }
}

const loadContentSnapshot = cache(async (): Promise<ContentSnapshot> => {
  const [
    firebaseApps,
    localApps,
    firebaseConcepts,
    localConcepts,
    firebaseLectures,
    localLectures,
  ] = await Promise.all([
    firebaseContent.getApps(),
    localContent.getApps(),
    firebaseContent.getAllConcepts(),
    localContent.getAllConcepts(),
    firebaseContent.getAllLectures(),
    localContent.getAllLectures(),
  ])

  return buildContentSnapshot({
    firebaseApps,
    localApps,
    firebaseConcepts,
    localConcepts,
    firebaseLectures,
    localLectures,
  })
})

export async function getApps(): Promise<App[]> {
  const snapshot = await loadContentSnapshot()
  return snapshot.apps
}

export async function getFeaturedApps(): Promise<App[]> {
  const apps = await getApps()
  return apps.filter((app) => app.is_featured).slice(0, 3)
}

export async function getAppByBundleId(bundleId: string): Promise<App | null> {
  const apps = await getApps()
  return apps.find((app) => app.bundle_id === bundleId) || null
}

export async function getConceptsByAppId(appId: string): Promise<Concept[]> {
  const snapshot = await loadContentSnapshot()
  return sortAppConcepts(snapshot.concepts.filter((concept) => concept.app_id === appId))
}

export async function getConceptsByCategory(appId: string, category: string): Promise<Concept[]> {
  const concepts = await getConceptsByAppId(appId)
  return concepts.filter((concept) => concept.category === category)
}

export async function getLecturesByAppId(appId: string): Promise<Lecture[]> {
  const snapshot = await loadContentSnapshot()
  return sortLectures(snapshot.lectures.filter((lecture) => lecture.app_id === appId))
}

export async function getLecturesByCategory(appId: string, category: string): Promise<Lecture[]> {
  const lectures = await getLecturesByAppId(appId)
  return lectures.filter((lecture) => lecture.category === category)
}

export async function getAllConcepts(): Promise<ConceptWithAppName[]> {
  const snapshot = await loadContentSnapshot()
  return snapshot.concepts
}

export async function getAllLectures(): Promise<LectureWithAppName[]> {
  const snapshot = await loadContentSnapshot()
  return snapshot.lectures
}

export async function getAppsWithContentCounts(): Promise<AppWithContentCounts[]> {
  const snapshot = await loadContentSnapshot()
  const conceptCounts = new Map<string, number>()
  const lectureCounts = new Map<string, number>()

  snapshot.concepts.forEach((concept) => {
    conceptCounts.set(concept.app_id, (conceptCounts.get(concept.app_id) || 0) + 1)
  })

  snapshot.lectures.forEach((lecture) => {
    lectureCounts.set(lecture.app_id, (lectureCounts.get(lecture.app_id) || 0) + 1)
  })

  return snapshot.apps.map((app) => ({
    ...app,
    conceptCount: conceptCounts.get(app.bundle_id) || 0,
    lectureCount: lectureCounts.get(app.bundle_id) || 0,
  }))
}
