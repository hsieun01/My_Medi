"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, User, Pill, LogOut, History, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const mainNavItems = [
  { href: "/", label: "홈", icon: Home, description: "오늘의 복약 현황" },
  { href: "/search", label: "정보탐색", icon: Search, description: "질환·약 정보 검색" },
  { href: "/mypage", label: "마이페이지", icon: User, description: "내 정보 관리" },
]

const subNavItems = [
  { href: "/mypage/history", label: "복약 이력", icon: History },
  { href: "/settings", label: "설정", icon: Settings },
]

export function SidebarNavigation() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card border-r border-border fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
            <Pill className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-xl text-foreground">My-Medi</span>
            <p className="text-xs text-muted-foreground">스마트 복약 관리</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {mainNavItems.map(item => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href))
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <p className="text-xs opacity-80">{item.description}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="px-4 text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Quick Access
          </p>
          <div className="space-y-1">
            {subNavItems.map(item => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                    isActive 
                      ? "bg-secondary text-foreground" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-xl">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">사용자</p>
            <p className="text-xs text-muted-foreground truncate">user@example.com</p>
          </div>
          <button 
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="로그아웃"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </aside>
  )
}
