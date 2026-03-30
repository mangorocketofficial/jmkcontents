import { buildContentSnapshot, getHomepageExamPreview } from '../content'
import type { App, Concept, Lecture } from '../firebase/types'

function createApp(overrides: Partial<App> & Pick<App, 'bundle_id' | 'app_name'>): App {
  return {
    status: 'published',
    app_category: '기사',
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
    bundle_id: overrides.bundle_id,
    app_name: overrides.app_name,
  }
}

type ConceptWithAppName = Concept & { app_name: string }

function createConcept(
  overrides: Partial<ConceptWithAppName> & Pick<Concept, 'id' | 'app_id' | 'title'>
): ConceptWithAppName {
  return {
    category: '기본',
    content: '내용',
    importance: 3,
    keywords: '키워드',
    study_note: '노트',
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
    id: overrides.id,
    app_id: overrides.app_id,
    title: overrides.title,
    app_name: overrides.app_name || '기본 과목',
  }
}

type LectureWithAppName = Lecture & { app_name: string }

function createLecture(
  overrides: Partial<LectureWithAppName> & Pick<Lecture, 'id' | 'app_id' | 'title'>
): LectureWithAppName {
  return {
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
    id: overrides.id,
    app_id: overrides.app_id,
    title: overrides.title,
    app_name: overrides.app_name || '기본 과목',
  }
}

describe('buildContentSnapshot', () => {
  it('merges Firebase and local apps so both content sources are published together', () => {
    const snapshot = buildContentSnapshot({
      firebaseApps: [
        createApp({
          bundle_id: 'indsafety',
          app_name: '산업안전기사',
          description: 'firebase description',
          is_featured: true,
          updated_at: new Date('2026-02-10T00:00:00.000Z'),
        }),
        createApp({
          bundle_id: 'gigecha',
          app_name: '지게차운전기능사',
          app_category: '기능사',
          updated_at: new Date('2026-02-08T00:00:00.000Z'),
        }),
      ],
      localApps: [
        createApp({
          bundle_id: 'comactiv2',
          app_name: '컴퓨터활용능력 2급',
          app_category: '컴퓨터자격증',
          updated_at: new Date('2026-03-20T00:00:00.000Z'),
        }),
        createApp({
          bundle_id: 'indsafety',
          app_name: '산업안전기사',
          description: 'local description',
          updated_at: new Date('2026-03-10T00:00:00.000Z'),
        }),
      ],
      firebaseConcepts: [
        createConcept({
          id: 'f-1',
          app_id: 'indsafety',
          title: '위험성 평가',
          app_name: '산업안전기사',
        }),
        createConcept({
          id: 'orphan',
          app_id: 'draft-app',
          title: '숨겨진 개념',
          app_name: 'draft',
        }),
      ],
      localConcepts: [
        createConcept({
          id: 'l-1',
          app_id: 'comactiv2',
          title: '셀 참조',
          app_name: '컴퓨터활용능력 2급',
          updated_at: new Date('2026-03-21T00:00:00.000Z'),
        }),
      ],
      firebaseLectures: [
        createLecture({
          id: 'lec-1',
          app_id: 'indsafety',
          title: '산업안전 기본 강의',
          app_name: '산업안전기사',
        }),
      ],
      localLectures: [],
    })

    expect(snapshot.apps.map((app) => app.bundle_id)).toEqual([
      'indsafety',
      'comactiv2',
      'gigecha',
    ])
    expect(snapshot.apps).toHaveLength(3)
    expect(snapshot.apps.find((app) => app.bundle_id === 'indsafety')?.description).toBe('local description')

    expect(snapshot.concepts.map((concept) => concept.app_id)).toEqual([
      'comactiv2',
      'indsafety',
    ])
    expect(snapshot.lectures.map((lecture) => lecture.app_id)).toEqual(['indsafety'])
  })

  it('deduplicates shared concepts by app and id, keeping the newest record', () => {
    const snapshot = buildContentSnapshot({
      firebaseApps: [
        createApp({
          bundle_id: 'comactiv2',
          app_name: '컴퓨터활용능력 2급',
        }),
      ],
      localApps: [],
      firebaseConcepts: [
        createConcept({
          id: 'same-id',
          app_id: 'comactiv2',
          title: '이전 개념',
          content: 'old',
          updated_at: new Date('2026-03-01T00:00:00.000Z'),
          app_name: '예전 과목명',
        }),
      ],
      localConcepts: [
        createConcept({
          id: 'same-id',
          app_id: 'comactiv2',
          title: '최신 개념',
          content: 'new',
          updated_at: new Date('2026-03-25T00:00:00.000Z'),
          app_name: '컴퓨터활용능력 2급',
        }),
      ],
      firebaseLectures: [],
      localLectures: [],
    })

    expect(snapshot.concepts).toHaveLength(1)
    expect(snapshot.concepts[0].title).toBe('최신 개념')
    expect(snapshot.concepts[0].app_name).toBe('컴퓨터활용능력 2급')
  })

  it('fills the homepage preview with non-featured exams when there are not enough featured exams', () => {
    const exams = getHomepageExamPreview([
      createApp({
        bundle_id: 'comactiv2',
        app_name: '컴퓨터활용능력 2급',
        is_featured: true,
      }),
      createApp({
        bundle_id: 'jigechaunjeongineungsa',
        app_name: '지게차운전기능사',
      }),
      createApp({
        bundle_id: 'saneobanjeonsaneobgisa',
        app_name: '산업안전산업기사',
      }),
      createApp({
        bundle_id: 'miyongsa',
        app_name: '미용사',
      }),
    ])

    expect(exams.map((exam) => exam.bundle_id)).toEqual([
      'comactiv2',
      'jigechaunjeongineungsa',
      'saneobanjeonsaneobgisa',
    ])
  })
})
