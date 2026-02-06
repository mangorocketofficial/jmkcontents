import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/types'
import { isAdminAuthenticated } from '@/app/actions/auth'

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authenticated = await isAdminAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contactId, status } = await request.json()

    if (!contactId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = getFirestoreDb()
    await db.collection(COLLECTIONS.CONTACT_SUBMISSIONS).doc(contactId).update({
      status,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update contact status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
