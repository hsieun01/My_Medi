"use client"

import { useState } from "react"
import { Calendar, Plus, Pill } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { MedicationCard } from "@/components/medication-card"
import { AddMedicationModal } from "@/components/add-medication-modal"
import { ProgressBar } from "@/components/progress-bar"
import { Button } from "@/components/ui/button"
import { useMedication } from "@/lib/medication-context"

export default function DashboardPage() {
  const { getTodayLogs, logMedication, getWeeklyStats, medications } = useMedication()
  const [showAddModal, setShowAddModal] = useState(false)

  const todayLogs = getTodayLogs()
  const weeklyStats = getWeeklyStats()
  const averageRate = Math.round(
    weeklyStats.reduce((sum, day) => sum + day.rate, 0) / weeklyStats.length
  )

  const today = new Date()
  const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

  const formattedDate = `${today.getFullYear()}년 ${monthNames[today.getMonth()]} ${today.getDate()}일 ${dayNames[today.getDay()]}`

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="max-w-md lg:max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">오늘 복용할 약</h1>
        </div>

        {/* Medication List */}
        {medications.length === 0 ? (
          <EmptyState onAddClick={() => setShowAddModal(true)} />
        ) : (
          <div className="space-y-3 mb-8">
            {todayLogs.map(log => (
              <MedicationCard
                key={log.id}
                medication={log.medication}
                log={log}
                onToggle={() => logMedication(log.medicationId, log.period)}
              />
            ))}
          </div>
        )}

        {/* Progress Section */}
        {medications.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <ProgressBar value={averageRate} />
          </div>
        )}

        {/* Add Medication FAB */}
        <Button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="새 약 추가하기"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <AddMedicationModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
        />
      </main>
    </div>
  )
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
        <Pill className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">
        아직 등록된 약이 없어요
      </h2>
      <p className="text-muted-foreground mb-6">
        첫 복용 약을 추가해보세요!
      </p>
      <Button
        onClick={onAddClick}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        약 추가하기
      </Button>
    </div>
  )
}
