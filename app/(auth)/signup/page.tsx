"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Pill, Mail, Lock, Eye, EyeOff, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const passwordRequirements = [
  { key: "length", label: "8자 이상", test: (pw: string) => pw.length >= 8 },
  { key: "letter", label: "영문 포함", test: (pw: string) => /[a-zA-Z]/.test(pw) },
  { key: "number", label: "숫자 포함", test: (pw: string) => /[0-9]/.test(pw) },
]

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    agreeMarketing: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getPasswordStrength = (password: string) => {
    const passed = passwordRequirements.filter(req => req.test(password)).length
    if (passed === 0) return { level: "none", label: "", color: "" }
    if (passed === 1) return { level: "weak", label: "약함", color: "text-destructive" }
    if (passed === 2) return { level: "medium", label: "보통", color: "text-warning" }
    return { level: "strong", label: "강함", color: "text-success" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))

    const newErrors = { ...errors }

    if (field === "email") {
      if (!formData.email) {
        newErrors.email = "이메일을 입력해주세요"
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "올바른 이메일 주소를 입력해주세요"
      } else {
        delete newErrors.email
      }
    }

    if (field === "confirmPassword" && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
      } else {
        delete newErrors.confirmPassword
      }
    }

    setErrors(newErrors)
  }

  const [supabase] = useState(() => createClient())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "올바른 이메일 주소를 입력해주세요"
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요"
    } else if (passwordStrength.level !== "strong") {
      newErrors.password = "비밀번호 조건을 모두 충족해주세요"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
    }

    if (!formData.agreeTerms) {
      newErrors.terms = "필수 약관에 동의해주세요"
    }

    setErrors(newErrors)
    setTouched({ email: true, password: true, confirmPassword: true, terms: true })

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true)
      try {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          toast.error(error.message || "회원가입에 실패했습니다")
          return
        }

        toast.success("회원가입이 완료되었습니다. 이메일을 확인해주세요.")
        router.push("/login")
      } catch (err) {
        console.error("Signup unexpected error:", err)
        toast.error("오류가 발생했습니다. 다시 시도해 주세요.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Desktop: Left side illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-center items-center text-primary-foreground">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 bg-primary-foreground/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Pill className="h-14 w-14" />
          </div>
          <h1 className="text-4xl font-bold mb-4">My-Medi와 함께</h1>
          <p className="text-xl text-primary-foreground/80 mb-8">
            안전하게 복약을 관리해보세요
          </p>
          <div className="space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <span>간편한 약 등록 및 복약 관리</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <span>AI 기반 의약 정보 제공</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <span>복약 이력 자동 기록 및 분석</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 lg:px-8 h-14 border-b border-border bg-card">
          <Link
            href="/welcome"
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
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">회원가입</h1>
              <p className="text-muted-foreground">안전하게 복약을 관리해보세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  이메일 주소 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className={cn(
                      "pl-10 h-12",
                      touched.email && errors.email && "border-destructive focus-visible:ring-destructive"
                    )}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    onBlur={() => handleBlur("email")}
                    aria-invalid={touched.email && !!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {touched.email && errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  비밀번호 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {passwordRequirements.map(req => {
                    const passed = req.test(formData.password)
                    return (
                      <span
                        key={req.key}
                        className={cn(
                          "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                          passed
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {req.label}
                      </span>
                    )
                  })}
                </div>

                {formData.password && (
                  <p className={cn("text-sm", passwordStrength.color)}>
                    비밀번호 강도: {passwordStrength.label}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  비밀번호 확인 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "pl-10 pr-10 h-12",
                      touched.confirmPassword && errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                    )}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    onBlur={() => handleBlur("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, agreeTerms: checked === true }))
                    }
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                      <Link href="/terms" className="text-primary hover:underline">이용약관</Link> 및{" "}
                      <Link href="/privacy" className="text-primary hover:underline">개인정보처리방침</Link>에 동의합니다{" "}
                      <span className="text-destructive">(필수)</span>
                    </Label>
                  </div>
                </div>
                {touched.terms && errors.terms && (
                  <p className="text-sm text-destructive pl-7" role="alert">
                    {errors.terms}
                  </p>
                )}

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="marketing"
                    checked={formData.agreeMarketing}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, agreeMarketing: checked === true }))
                    }
                    className="mt-0.5"
                  />
                  <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                    건강 정보 알림 수신에 동의합니다 <span className="text-muted-foreground">(선택)</span>
                  </Label>
                </div>
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
                    가입 중...
                  </>
                ) : (
                  "가입하기"
                )}
              </Button>
            </form>

            {/* Login Link */}
            <p className="text-center mt-6 text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                로그인
              </Link>
            </p>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  또는 다른 방법으로 계속하기
                </span>
              </div>
            </div>

            {/* Social Login */}
            <Button
              variant="outline"
              className="w-full h-12 bg-transparent"
              type="button"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 계속하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
