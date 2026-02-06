'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/types'
import { ChevronDown } from 'lucide-react'

interface UpdateContactStatusButtonProps {
  contactId: string
  currentStatus: string
}

export function UpdateContactStatusButton({
  contactId,
  currentStatus,
}: UpdateContactStatusButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const statuses = [
    { value: 'pending', label: '대기' },
    { value: 'in_progress', label: '처리 중' },
    { value: 'resolved', label: '완료' },
  ]

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch('/api/admin/contacts/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('상태 업데이트 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Update status error:', error)
      alert('상태 업데이트 중 오류가 발생했습니다.')
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        상태 변경
        <ChevronDown className="w-4 h-4" />
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-background border rounded-lg shadow-lg z-20">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                disabled={status.value === currentStatus}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  status.value === currentStatus
                    ? 'bg-muted font-medium'
                    : ''
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
