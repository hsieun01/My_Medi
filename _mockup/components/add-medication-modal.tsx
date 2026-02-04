"use client"

import React, { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMedication, type Medication, type MedicationSchedule } from "@/lib/medication-context"
import { cn } from "@/lib/utils"

interface AddMedicationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingMedication?: Medication | null
}

const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"]

export function AddMedicationModal({ 
  open, 
  onOpenChange, 
  editingMedication 
}: AddMedicationModalProps) {
  const { addMedication, updateMedication } = useMedication()
  const isEditing = !!editingMedication

  // Form state
  const [name, setName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState<"once" | "twice" | "three_times">("once")
  const [morningEnabled, setMorningEnabled] = useState(false)
  const [lunchEnabled, setLunchEnabled] = useState(false)
  const [eveningEnabled, setEveningEnabled] = useState(false)
  const [morningTime, setMorningTime] = useState("08:00")
  const [lunchTime, setLunchTime] = useState("12:00")
  const [eveningTime, setEveningTime] = useState("20:00")
  const [precautions, setPrecautions] = useState("")
  
  // Schedule state
  const [scheduleType, setScheduleType] = useState<"today" | "repeat" | "period">("repeat")
  const [repeatDays, setRepeatDays] = useState<string[]>(DAYS_OF_WEEK)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Reset or populate form when modal opens/closes or editing medication changes
  useEffect(() => {
    if (open && editingMedication) {
      // Populate form with existing medication data
      setName(editingMedication.name)
      setDosage(editingMedication.dosage || "")
      setFrequency(editingMedication.frequency)
      setMorningEnabled(!!editingMedication.times.morning)
      setLunchEnabled(!!editingMedication.times.lunch)
      setEveningEnabled(!!editingMedication.times.evening)
      setMorningTime(editingMedication.times.morning || "08:00")
      setLunchTime(editingMedication.times.lunch || "12:00")
      setEveningTime(editingMedication.times.evening || "20:00")
      setPrecautions(editingMedication.precautions || "")
      
      // Schedule
      if (editingMedication.schedule) {
        setScheduleType(editingMedication.schedule.type)
        setRepeatDays(editingMedication.schedule.repeatDays || DAYS_OF_WEEK)
        setStartDate(editingMedication.schedule.startDate || "")
        setEndDate(editingMedication.schedule.endDate || "")
      } else {
        setScheduleType("repeat")
        setRepeatDays(DAYS_OF_WEEK)
        setStartDate("")
        setEndDate("")
      }
    } else if (open && !editingMedication) {
      // Reset form for new medication
      resetForm()
    }
  }, [open, editingMedication])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const times: Medication["times"] = {}
    if (morningEnabled) times.morning = morningTime
    if (lunchEnabled) times.lunch = lunchTime
    if (eveningEnabled) times.evening = eveningTime

    const schedule: MedicationSchedule = {
      type: scheduleType,
      ...(scheduleType === "repeat" && { repeatDays }),
      ...(scheduleType === "period" && { startDate, endDate }),
      ...(scheduleType === "today" && { 
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0]
      })
    }

    const medicationData = {
      name,
      dosage: dosage || undefined,
      frequency,
      times,
      precautions: precautions || undefined,
      schedule
    }

    if (isEditing && editingMedication) {
      updateMedication(editingMedication.id, medicationData)
    } else {
      addMedication(medicationData)
    }

    onOpenChange(false)
  }

  const resetForm = () => {
    setName("")
    setDosage("")
    setFrequency("once")
    setMorningEnabled(false)
    setLunchEnabled(false)
    setEveningEnabled(false)
    setMorningTime("08:00")
    setLunchTime("12:00")
    setEveningTime("20:00")
    setPrecautions("")
    setScheduleType("repeat")
    setRepeatDays(DAYS_OF_WEEK)
    setStartDate("")
    setEndDate("")
  }

  const toggleDay = (day: string) => {
    setRepeatDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const isValid = name.trim() && 
    (morningEnabled || lunchEnabled || eveningEnabled) &&
    (scheduleType !== "repeat" || repeatDays.length > 0) &&
    (scheduleType !== "period" || (startDate && endDate))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEditing ? "약 정보 수정" : "새 약 추가하기"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              약 이름 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: Aspirin"
              required
            />
          </div>

          {/* Dosage */}
          <div className="space-y-2">
            <Label htmlFor="dosage">용량 (선택)</Label>
            <Input
              id="dosage"
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              placeholder="예: 500mg, 1정"
            />
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <Label>
              복용 횟수 <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={frequency}
              onValueChange={(val: "once" | "twice" | "three_times") =>
                setFrequency(val)
              }
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="once" id="once" />
                <Label htmlFor="once" className="font-normal cursor-pointer">
                  1일 1회
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="twice" id="twice" />
                <Label htmlFor="twice" className="font-normal cursor-pointer">
                  1일 2회
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="three_times" id="three_times" />
                <Label htmlFor="three_times" className="font-normal cursor-pointer">
                  1일 3회
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Times */}
          <div className="space-y-3">
            <Label>
              복용 시간 <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="morning"
                  checked={morningEnabled}
                  onCheckedChange={checked => setMorningEnabled(!!checked)}
                />
                <Label htmlFor="morning" className="font-normal cursor-pointer flex-1">
                  아침
                </Label>
                <Input
                  type="time"
                  value={morningTime}
                  onChange={e => setMorningTime(e.target.value)}
                  disabled={!morningEnabled}
                  className="w-28"
                />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="lunch"
                  checked={lunchEnabled}
                  onCheckedChange={checked => setLunchEnabled(!!checked)}
                />
                <Label htmlFor="lunch" className="font-normal cursor-pointer flex-1">
                  점심
                </Label>
                <Input
                  type="time"
                  value={lunchTime}
                  onChange={e => setLunchTime(e.target.value)}
                  disabled={!lunchEnabled}
                  className="w-28"
                />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="evening"
                  checked={eveningEnabled}
                  onCheckedChange={checked => setEveningEnabled(!!checked)}
                />
                <Label htmlFor="evening" className="font-normal cursor-pointer flex-1">
                  저녁
                </Label>
                <Input
                  type="time"
                  value={eveningTime}
                  onChange={e => setEveningTime(e.target.value)}
                  disabled={!eveningEnabled}
                  className="w-28"
                />
              </div>
            </div>
          </div>

          {/* Schedule Type */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              복용 기간 <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={scheduleType}
              onValueChange={(val: "today" | "repeat" | "period") =>
                setScheduleType(val)
              }
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="today" id="today" />
                <Label htmlFor="today" className="font-normal cursor-pointer">
                  오늘만
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="repeat" id="repeat" />
                <Label htmlFor="repeat" className="font-normal cursor-pointer">
                  요일별 반복
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="period" id="period" />
                <Label htmlFor="period" className="font-normal cursor-pointer">
                  특정 기간
                </Label>
              </div>
            </RadioGroup>

            {/* Repeat Days Selection */}
            {scheduleType === "repeat" && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">반복할 요일 선택</p>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "w-10 h-10 rounded-full text-sm font-medium transition-colors",
                        repeatDays.includes(day)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Period Date Selection */}
            {scheduleType === "period" && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <Label htmlFor="startDate" className="w-16 text-sm">시작일</Label>
                  <Input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="endDate" className="w-16 text-sm">종료일</Label>
                  <Input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={startDate}
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Precautions */}
          <div className="space-y-2">
            <Label htmlFor="precautions">주의사항 (선택)</Label>
            <Input
              id="precautions"
              value={precautions}
              onChange={e => setPrecautions(e.target.value)}
              placeholder="복용 시 주의사항을 입력하세요"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground"
              disabled={!isValid}
            >
              {isEditing ? "수정하기" : "저장하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
