"use client";

import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { Button } from "@/components/ui/button";
import { MedicationCard } from "@/components/posts/medication-card";
import { ProgressBar } from "@/components/posts/progress-bar";
import { AddMedicationModal } from "@/components/posts/add-medication-modal";
import { DashboardEmptyState } from "@/components/posts/dashboard-empty-state";
import { useMedication } from "@/lib/medication-context";

export default function DashboardPage() {
  const { getTodayLogs, logMedication, getWeeklyStats, medications } =
    useMedication();
  const [showAddModal, setShowAddModal] = useState(false);

  const todayLogs = getTodayLogs();
  const weeklyStats = getWeeklyStats();
  const averageRate =
    weeklyStats.length === 0
      ? 0
      : Math.round(
          weeklyStats.reduce((sum, day) => sum + day.rate, 0) /
            weeklyStats.length,
        );

  const today = new Date();
  const dayNames = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const formattedDate = `${today.getFullYear()}년 ${
    monthNames[today.getMonth()]
  } ${today.getDate()}일 ${dayNames[today.getDay()]}`;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-md lg:max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {/* Date & heading */}
        <section className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            오늘 복용할 약
          </h1>
        </section>

        {/* Medication list / Empty state */}
        <section className="mb-8">
          {medications.length === 0 ? (
            <DashboardEmptyState onAddClick={() => setShowAddModal(true)} />
          ) : (
            <div className="space-y-3">
              {todayLogs.map((log) => (
                <MedicationCard
                  key={log.id}
                  medication={log.medication}
                  log={log}
                  onToggle={() => logMedication(log.medicationId, log.period)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Weekly progress */}
        {medications.length > 0 && (
          <section className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <ProgressBar value={averageRate} />
          </section>
        )}

        {/* Add Medication FAB */}
        <Button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="새 약 추가하기"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <AddMedicationModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
        />
      </main>
    </div>
  );
}
