"use client";

import Link from "next/link";
import { Pill, User, Bell } from "lucide-react";

interface AppHeaderProps {
  title?: string;
  showProfile?: boolean;
}

export function AppHeader({ title, showProfile = true }: AppHeaderProps) {
  return (
    <header className="sticky top-0 bg-card border-b border-border z-40">
      <div className="max-w-md lg:max-w-none mx-auto flex items-center justify-between px-4 lg:px-8 h-14 lg:h-16">
        {/* Mobile: Logo & title */}
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Pill className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">
            {title || "My-Medi"}
          </span>
        </Link>

        {/* Desktop: Page title */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-foreground">
            {title || "대시보드"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="알림"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Profile */}
          {showProfile && (
            <Link
              href="/mypage"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="마이페이지로 이동"
            >
              <User className="h-5 w-5 text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

