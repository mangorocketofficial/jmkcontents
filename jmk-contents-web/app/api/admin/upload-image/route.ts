import { NextRequest, NextResponse } from 'next/server'
import { getStorage } from 'firebase-admin/storage'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { isAdminAuthenticated } from '@/app/actions/auth'

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'affiliate-ads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Firebase Storage 업로드
    const app = getFirebaseAdmin()
    const storage = getStorage(app)
    const bucket = storage.bucket('exam-affiliate-ads.firebasestorage.app')

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${folder}/${timestamp}_${sanitizedFileName}`

    // 파일 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Storage에 업로드
    const fileUpload = bucket.file(fileName)
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    })

    // 공개 URL 생성
    await fileUpload.makePublic()
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
