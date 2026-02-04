"use client"

import Link from "next/link"
import { Pill, Check, Search, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Check,
    text: "오늘 먹을 약 한눈에 확인",
  },
  {
    icon: Search,
    text: "AI가 쉽게 설명하는 의학 정보",
  },
  {
    icon: BarChart3,
    text: "복약 이력 자동 기록",
  },
]

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop: Two-column layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left side - Hero/Benefits (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-center items-center text-primary-foreground">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
                <Pill className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">My-Medi</h1>
                <p className="text-primary-foreground/80">스마트 복약 관리</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-6">
              매일 복약,<br />쉽게 관리하세요
            </h2>
            
            <p className="text-lg text-primary-foreground/80 mb-8">
              My-Medi와 함께라면 복잡한 복약 스케줄도 간단해집니다. 
              AI 기반 의약 정보와 함께 건강을 관리하세요.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-lg">{feature.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* Right side - CTA (Mobile: Full screen, Desktop: Half) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            {/* Mobile Logo */}
            <div className="flex flex-col items-center mb-12 lg:hidden">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4">
                <Pill className="h-12 w-12 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">My-Medi</h1>
              <p className="text-muted-foreground">스마트 복약 관리</p>
            </div>
            
            {/* Desktop Heading */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">시작하기</h2>
              <p className="text-muted-foreground">
                간편하게 가입하고 복약 관리를 시작하세요
              </p>
            </div>
            
            {/* Mobile Features */}
            <div className="space-y-3 mb-10 lg:hidden">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature.text}</span>
                  </div>
                )
              })}
            </div>
            
            {/* CTAs */}
            <div className="space-y-4">
              <Button asChild className="w-full h-12 text-base font-semibold">
                <Link href="/signup">시작하기</Link>
              </Button>
              
              <div className="text-center">
                <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
                <Link href="/login" className="text-primary font-medium hover:underline">
                  로그인
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
