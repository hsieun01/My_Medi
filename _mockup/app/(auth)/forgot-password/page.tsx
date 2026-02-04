"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Pill, Mail, Loader2, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("이메일을 입력해주세요")
      return
    }
    
    if (!validateEmail(email)) {
      setError("올바른 이메일 주소를 입력해주세요")
      return
    }

    setError("")
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  const handleResend = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 lg:px-8 h-14 border-b border-border bg-card">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Pill className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">My-Medi</span>
          </Link>
        </header>

        {/* Success State */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MailCheck className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              이메일을 확인해주세요!
            </h1>
            <p className="text-muted-foreground mb-2">
              <span className="font-medium text-foreground">{email}</span>으로
            </p>
            <p className="text-muted-foreground mb-8">
              비밀번호 재설정 링크를 보냈습니다
            </p>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                이메일이 오지 않았나요?
              </p>
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onClick={handleResend}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  "다시 보내기"
                )}
              </Button>
              
              <Button asChild className="w-full h-12">
                <Link href="/login">로그인으로 돌아가기</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Desktop: Left side illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-center items-center text-primary-foreground">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 bg-primary-foreground/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Mail className="h-14 w-14" />
          </div>
          <h1 className="text-4xl font-bold mb-4">걱정하지 마세요!</h1>
          <p className="text-xl text-primary-foreground/80">
            이메일로 재설정 링크를 보내드릴게요
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 lg:px-8 h-14 border-b border-border bg-card">
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">뒤로</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Pill className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">My-Medi</span>
          </Link>
          <div className="w-16" />
        </header>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">비밀번호 찾기</h1>
              <p className="text-muted-foreground">
                걱정하지 마세요! 이메일로 재설정 링크를 보내드릴게요
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">가입하신 이메일 주소</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className={cn(
                      "pl-10 h-12",
                      error && "border-destructive focus-visible:ring-destructive"
                    )}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                    aria-describedby={error ? "email-error" : undefined}
                  />
                </div>
                {error && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  "재설정 링크 보내기"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-primary font-medium hover:underline"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
