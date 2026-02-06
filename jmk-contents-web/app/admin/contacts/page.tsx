import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/types'
import { Mail } from 'lucide-react'
import { UpdateContactStatusButton } from '@/components/admin/UpdateContactStatusButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'pending' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
}

export default async function AdminContactsPage() {
  const db = getFirestoreDb()
  const contactsSnapshot = await db
    .collection(COLLECTIONS.CONTACT_SUBMISSIONS)
    .orderBy('created_at', 'desc')
    .get()

  const contacts: ContactSubmission[] = contactsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ContactSubmission, 'id'>),
  }))

  const pendingCount = contacts.filter((c) => c.status === 'pending').length
  const inProgressCount = contacts.filter((c) => c.status === 'in_progress').length
  const resolvedCount = contacts.filter((c) => c.status === 'resolved').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기'
      case 'in_progress':
        return '처리 중'
      case 'resolved':
        return '완료'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">문의사항 관리</h1>
        <p className="text-muted-foreground">총 {contacts.length}건의 문의사항</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">대기 중</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{inProgressCount}</div>
            <div className="text-sm text-muted-foreground">처리 중</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{resolvedCount}</div>
            <div className="text-sm text-muted-foreground">완료</div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      {contacts.length > 0 ? (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{contact.subject}</CardTitle>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          contact.status
                        )}`}
                      >
                        {getStatusLabel(contact.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{contact.name}</span>
                      <span>•</span>
                      <span>{contact.email}</span>
                      <span>•</span>
                      <span>
                        {new Date(contact.created_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <UpdateContactStatusButton
                    contactId={contact.id}
                    currentStatus={contact.status}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">{contact.message}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">문의사항이 없습니다</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
