import { MedicationProvider } from '@/lib/medication-context'
import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'My-Medi | 스마트 복약 관리',
  description: '매일 복용할 약을 쉽게 관리하고, 질환과 약 정보를 AI로 쉽게 이해하세요.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#3B82F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
 return (
  <html lang="ko">
    <body className={`${inter.className} antialiased`}>
      <MedicationProvider>
        {children}
      </MedicationProvider>
      <Analytics />
    </body>
  </html>
)
}
