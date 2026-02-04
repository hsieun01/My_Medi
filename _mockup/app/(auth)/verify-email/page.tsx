"use client"

import { useState } from "react"
import Link from "next/link"
import { Pill, Mail, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const email = "user@example.com" // This would come from context/state in real app

  const handleResend = async () => {
    setIsResending(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsResending(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center px-4 lg:px-8 h-14 border-b border-border bg-card">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Pill className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">My-Medi</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            이메일 인증이 필요해요
          </h1>
          <p className="text-muted-foreground mb-2">
            <span className="font-medium text-foreground">{email}</span>으로
          </p>
          <p className="text-muted-foreground mb-8">
            인증 링크를 보냈습니다
          </p>

          <div className="bg-secondary/50 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm font-medium text-foreground mb-2">
              이메일이 오지 않았나요?
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- 스팸 메일함을 확인해보세요</li>
              <li>- 이메일 주소가 맞는지 확인해보세요</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-12 bg-transparent"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  전송 중...
                </>
              ) : (
                "인증 이메일 다시 보내기"
              )}
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground">이메일 주소를 변경하고 싶으신가요? </span>
              <Link href="/signup" className="text-primary font-medium hover:underline">
                이메일 변경하기
              </Link>
            </div>
          </div>

          {/* Skip for demo - remove in production */}
          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">
              (데모용) 인증 없이 계속하기
            </p>
            <Button asChild variant="ghost" className="text-primary">
              <Link href="/onboarding">
                온보딩으로 이동
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
