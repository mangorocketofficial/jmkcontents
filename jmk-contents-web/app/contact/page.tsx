import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">문의하기</h1>
        <p className="text-xl text-muted-foreground">
          궁금하신 사항이 있으시면 언제든지 문의해 주세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>연락 정보</CardTitle>
          <CardDescription>
            아래 양식을 작성하시거나 이메일로 직접 문의해 주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                이름
              </label>
              <Input id="name" placeholder="홍길동" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                이메일 *
              </label>
              <Input id="email" type="email" placeholder="example@email.com" required />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                제목
              </label>
              <Input id="subject" placeholder="문의 제목" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                메시지 *
              </label>
              <Textarea
                id="message"
                placeholder="문의 내용을 입력해 주세요"
                rows={6}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              문의 보내기
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t">
            <h3 className="font-bold mb-4">직접 연락하기</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 이메일: bombezzang100@gmail.com</p>
              <p>⏰ 운영 시간: 평일 오전 9시 - 오후 6시 (KST)</p>
              <p>💬 답변 시간: 영업일 기준 1-2일 이내</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
