"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, X, Clock, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMedication } from "@/lib/medication-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"

function HistoryContent() {
  const searchParams = useSearchParams()
  const initialView = searchParams.get("view") || "chart"
  const [activeTab, setActiveTab] = useState<"calendar" | "chart">(
    initialView as "calendar" | "chart"
  )
  const { getWeeklyStats, logs, medications } = useMedication()

  const weeklyStats = getWeeklyStats()
  const averageRate = Math.round(
    weeklyStats.reduce((sum, day) => sum + day.rate, 0) / weeklyStats.length
  )
  
  // Calculate last week average (simulated)
  const lastWeekAverage = averageRate - 5
  const improvement = averageRate - lastWeekAverage

  // Get recent logs grouped by date
  const recentLogs = getRecentLogs(logs, medications, 7)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40">
        <div className="max-w-md lg:max-w-4xl mx-auto flex items-center gap-3 px-4 lg:px-8 h-14 lg:h-16">
          <Link href="/mypage">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg lg:text-xl">복약 이력</h1>
        </div>
      </header>

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "calendar" | "chart")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="calendar">캘린더</TabsTrigger>
            <TabsTrigger value="chart">차트</TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-4">
            <CalendarView recentLogs={recentLogs} />
          </TabsContent>

          {/* Chart View */}
          <TabsContent value="chart" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weekly Chart */}
              <div className="bg-card rounded-xl p-4 lg:p-6 shadow-sm border border-border">
                <h3 className="font-semibold text-foreground mb-4">주간 복약 성공률</h3>
                <div className="h-48 lg:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
                                <p className="text-sm font-medium">{payload[0].value}%</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                        {weeklyStats.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.rate >= 80 ? "#10B981" : entry.rate >= 50 ? "#F59E0B" : "#EF4444"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="bg-card rounded-xl p-4 lg:p-6 shadow-sm border border-border flex flex-col justify-center">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">이번 주 평균</p>
                    <p className="text-3xl lg:text-4xl font-bold text-foreground">{averageRate}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">지난 주 대비</p>
                    <div className={`flex items-center justify-end gap-1 ${improvement >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                      {improvement >= 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      <span className="text-xl lg:text-2xl font-semibold">
                        {improvement >= 0 ? "+" : ""}{improvement}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Check className="h-5 w-5 text-success" />
                    </div>
                    <p className="text-xs text-muted-foreground">완료</p>
                    <p className="font-semibold text-foreground">{weeklyStats.filter(d => d.rate >= 80).length}일</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <p className="text-xs text-muted-foreground">일부</p>
                    <p className="font-semibold text-foreground">{weeklyStats.filter(d => d.rate >= 50 && d.rate < 80).length}일</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <X className="h-5 w-5 text-destructive" />
                    </div>
                    <p className="text-xs text-muted-foreground">미완료</p>
                    <p className="font-semibold text-foreground">{weeklyStats.filter(d => d.rate < 50).length}일</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Logs List */}
            <div className="bg-card rounded-xl p-4 lg:p-6 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-4">복약 기록 (최근 7일)</h3>
              <div className="grid lg:grid-cols-2 gap-3">
                {recentLogs.map((dayLog, index) => (
                  <DayLogCard key={dayLog.date} dayLog={dayLog} isToday={index === 0} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistoryLoading />}>
      <HistoryContent />
    </Suspense>
  )
}

function HistoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-card border-b border-border z-40">
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 h-14">
          <div className="w-10 h-10 bg-secondary rounded-lg animate-pulse" />
          <div className="w-24 h-6 bg-secondary rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="w-full h-10 bg-secondary rounded-lg mb-6 animate-pulse" />
        <div className="w-full h-64 bg-secondary rounded-xl animate-pulse" />
      </main>
    </div>
  )
}

interface DayLog {
  date: string
  displayDate: string
  logs: {
    medicationName: string
    time: string
    taken: boolean
    scheduledTime: string
  }[]
}

function CalendarView({ recentLogs }: { recentLogs: DayLog[] }) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  // Generate calendar days
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const startingDay = firstDay.getDay()
  const totalDays = lastDay.getDate()
  
  const days: (number | null)[] = []
  for (let i = 0; i < startingDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i)
  }

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

  // Create a map of dates with logs
  const logsByDate = new Map<string, DayLog>()
  recentLogs.forEach(log => {
    logsByDate.set(log.date, log)
  })

  const getDayStatus = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const dayLog = logsByDate.get(dateStr)
    if (!dayLog) return null
    
    const totalLogs = dayLog.logs.length
    const takenLogs = dayLog.logs.filter(l => l.taken).length
    
    if (totalLogs === 0) return null
    if (takenLogs === totalLogs) return "complete"
    if (takenLogs > 0) return "partial"
    return "missed"
  }

  return (
    <>
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-foreground text-center mb-4">
          {currentYear}년 {monthNames[currentMonth]}
        </h3>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const status = getDayStatus(day)
            const isToday = day === today.getDate()

            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm relative
                  ${isToday ? "ring-2 ring-primary" : ""}
                  ${status === "complete" ? "bg-[#ECFDF5] text-[#10B981]" : ""}
                  ${status === "partial" ? "bg-amber-50 text-amber-600" : ""}
                  ${status === "missed" ? "bg-red-50 text-red-500" : ""}
                  ${!status ? "text-foreground" : ""}
                `}
              >
                {day}
                {status === "complete" && (
                  <Check className="h-3 w-3 absolute bottom-1 right-1" />
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#ECFDF5] border border-[#10B981]" />
            <span className="text-muted-foreground">완료</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-50 border border-amber-300" />
            <span className="text-muted-foreground">일부</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-50 border border-red-300" />
            <span className="text-muted-foreground">미복용</span>
          </div>
        </div>
      </div>

      {/* Recent logs below calendar */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-foreground mb-4">상세 기록</h3>
        <div className="space-y-3">
          {recentLogs.slice(0, 5).map((dayLog, index) => (
            <DayLogCard key={dayLog.date} dayLog={dayLog} isToday={index === 0} />
          ))}
        </div>
      </div>
    </>
  )
}

function DayLogCard({ dayLog, isToday }: { dayLog: DayLog; isToday: boolean }) {
  return (
    <div className="border border-border rounded-lg p-3">
      <p className="text-sm font-medium text-foreground mb-2">
        {dayLog.displayDate}
        {isToday && <span className="text-primary ml-2">(오늘)</span>}
      </p>
      <div className="space-y-1">
        {dayLog.logs.map((log, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {log.taken ? (
              <Check className="h-4 w-4 text-[#10B981]" />
            ) : new Date().toTimeString().slice(0, 5) < log.scheduledTime ? (
              <Clock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <X className="h-4 w-4 text-[#EF4444]" />
            )}
            <span className={log.taken ? "text-foreground" : "text-muted-foreground"}>
              {log.medicationName}
            </span>
            <span className="text-muted-foreground text-xs">
              {log.taken ? log.time : log.scheduledTime}
            </span>
            {!log.taken && new Date().toTimeString().slice(0, 5) < log.scheduledTime && (
              <span className="text-xs text-muted-foreground">(예정)</span>
            )}
            {!log.taken && new Date().toTimeString().slice(0, 5) >= log.scheduledTime && (
              <span className="text-xs text-[#EF4444]">(미복용)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function getRecentLogs(
  logs: { medicationId: string; date: string; time: string; taken: boolean; scheduledTime: string }[],
  medications: { id: string; name: string; times: { morning?: string; lunch?: string; evening?: string } }[],
  days: number
): DayLog[] {
  const result: DayLog[] = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const displayDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    
    const dayLogs: DayLog["logs"] = []
    
    medications.forEach(med => {
      const periods: ("morning" | "lunch" | "evening")[] = ["morning", "lunch", "evening"]
      periods.forEach(period => {
        if (med.times[period]) {
          const existingLog = logs.find(
            log => log.medicationId === med.id && log.date === dateStr
          )
          dayLogs.push({
            medicationName: med.name,
            time: existingLog?.time || "",
            taken: existingLog?.taken || false,
            scheduledTime: med.times[period]!
          })
        }
      })
    })

    if (dayLogs.length > 0) {
      result.push({
        date: dateStr,
        displayDate,
        logs: dayLogs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
      })
    }
  }
  
  return result
}
