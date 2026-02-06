"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Pill, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true)
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          toast.error(error.message || "로그인에 실패했습니다")
          return
        }

        router.push("/")
      } catch (err) {
        console.error("Login unexpected error:", err)
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
          <h1 className="text-4xl font-bold mb-4">다시 만나서 반가워요!</h1>
          <p className="text-xl text-primary-foreground/80">
            My-Medi와 함께 건강한 하루를 시작하세요
          </p>
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
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">로그인</h1>
              <p className="text-muted-foreground">다시 만나서 반가워요!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className={cn(
                      "pl-10 h-12",
                      errors.email && "border-destructive focus-visible:ring-destructive"
                    )}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "pl-10 pr-10 h-12",
                      errors.password && "border-destructive focus-visible:ring-destructive"
                    )}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
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
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, rememberMe: checked === true }))
                    }
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                    로그인 상태 유지
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  비밀번호 찾기
                </Link>
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
                    로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center mt-6 text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                회원가입
              </Link>
            </p>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  또는 다른 방법으로 로그인
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
              Google로 로그인
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
