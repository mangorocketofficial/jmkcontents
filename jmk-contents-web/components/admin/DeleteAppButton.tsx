'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteApp } from '@/app/actions/apps'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteAppButtonProps {
  bundleId: string
  appName: string
}

export function DeleteAppButton({ bundleId, appName }: DeleteAppButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        `정말로 "${appName}" 앱을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteApp(bundleId)

      if (result.success) {
        alert(result.message)
        router.refresh()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  )
}
