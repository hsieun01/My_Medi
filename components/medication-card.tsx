"use client"

import { useState } from "react"
import { Check, Clock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Medication, MedicationLog } from "@/lib/medication-context"

interface MedicationCardProps {
  medication: Medication
  log: MedicationLog
  onToggle: () => void
}

const periodLabels: Record<string, string> = {
  morning: "아침",
  lunch: "점심",
  evening: "저녁"
}

export function MedicationCard({ medication, log, onToggle }: MedicationCardProps) {
  const [showPrecautions, setShowPrecautions] = useState(false)
  const isTaken = log.taken
  const isPast = isTimePast(log.scheduledTime)

  return (
    <div
      className={cn(
        "rounded-xl p-4 shadow-sm transition-all",
        isTaken
          ? "bg-[#ECFDF5] border-2 border-[#10B981]/30"
          : isPast
            ? "bg-card border-2 border-[#F59E0B]"
            : "bg-card border border-border"
      )}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all",
            isTaken
              ? "bg-[#10B981] border-[#10B981]"
              : "bg-card border-border hover:border-primary"
          )}
          aria-label={isTaken ? "복용 취소" : "복용 체크"}
        >
          {isTaken && <Check className="h-5 w-5 text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">
              {medication.name}
              {medication.dosage && (
                <span className="font-normal text-muted-foreground ml-1">
                  {medication.dosage}
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-1 text-sm">
            <span className="text-muted-foreground">
              {periodLabels[log.period]} {log.scheduledTime}
            </span>
            <span className="text-muted-foreground">|</span>
            {isTaken ? (
              <span className="text-[#10B981] font-medium flex items-center gap-1">
                <Check className="h-4 w-4" />
                복용 완료
              </span>
            ) : isPast ? (
              <span className="text-[#F59E0B] font-medium flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                아직 안 먹음
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                예정
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            {!isTaken && isPast && (
              <Button
                size="sm"
                onClick={onToggle}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                복용 체크
              </Button>
            )}
            {medication.precautions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrecautions(!showPrecautions)}
                className="text-muted-foreground hover:text-foreground"
              >
                주의사항 보기
                {showPrecautions ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </Button>
            )}
          </div>

          {showPrecautions && medication.precautions && (
            <div className="mt-3 p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#F59E0B]" />
                <p>{medication.precautions}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function isTimePast(scheduledTime: string): boolean {
  const now = new Date()
  const [hours, minutes] = scheduledTime.split(":").map(Number)
  const scheduled = new Date()
  scheduled.setHours(hours, minutes, 0, 0)
  return now > scheduled
}
