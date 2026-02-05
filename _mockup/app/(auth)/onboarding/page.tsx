"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pill, Search, BarChart3, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const steps = [
  {
    title: "복용 중인 약을 등록해주세요",
    description: "등록하면 매일 복약 시간을 놓치지 않게 도와드려요",
    icon: Pill,
    action: "첫 약 등록하기",
    skipable: true,
  },
  {
    title: "질환 및 약 정보를 검색해보세요",
    description: "어려운 의학 용어를 AI가 쉽게 설명해드려요",
    icon: Search,
    action: null,
    skipable: true,
  },
  {
    title: "복약 이력을 자동으로 기록해요",
    description: "매일 체크하면 성공률을 그래프로 확인할 수 있어요",
    icon: BarChart3,
    action: "시작하기",
    skipable: false,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  
  const step = steps[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      router.push("/")
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    router.push("/")
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
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Welcome message for first step */}
          {currentStep === 0 && (
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-foreground mb-1">
                환영합니다!
              </h1>
              <p className="text-muted-foreground">
                My-Medi 시작하기
              </p>
            </div>
          )}

          {/* Progress */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2 text-center">
              Step {currentStep + 1}/{steps.length}
            </p>
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    index <= currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Icon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3 text-balance">
              {step.title}
            </h2>
            <p className="text-muted-foreground text-balance">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {step.action && (
              <Button 
                className="w-full h-12 text-base font-semibold"
                onClick={handleNext}
              >
                {step.action}
                {isLastStep && <Check className="h-5 w-5 ml-2" />}
              </Button>
            )}
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              {currentStep > 0 ? (
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  이전
                </Button>
              ) : (
                <div />
              )}
              
              {step.skipable && !isLastStep ? (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  나중에 하기
                </Button>
              ) : !step.action && !isLastStep ? (
                <Button
                  variant="ghost"
                  onClick={handleNext}
                  className="text-primary"
                >
                  다음
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
