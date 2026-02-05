"use client";

import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Medication,
  MedicationSchedule,
  useMedication,
} from "@/lib/medication-context";

interface AddMedicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMedication?: Medication | null;
}

const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"];

export function AddMedicationModal({
  open,
  onOpenChange,
  editingMedication,
}: AddMedicationModalProps) {
  const { addMedication, updateMedication } = useMedication();
  const isEditing = !!editingMedication;

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<
    "once" | "twice" | "three_times"
  >("once");
  const [morningEnabled, setMorningEnabled] = useState(false);
  const [lunchEnabled, setLunchEnabled] = useState(false);
  const [eveningEnabled, setEveningEnabled] = useState(false);
  const [morningTime, setMorningTime] = useState("08:00");
  const [lunchTime, setLunchTime] = useState("12:00");
  const [eveningTime, setEveningTime] = useState("20:00");
  const [precautions, setPrecautions] = useState("");

  const [scheduleType, setScheduleType] = useState<
    "today" | "repeat" | "period"
  >("repeat");
  const [repeatDays, setRepeatDays] = useState<string[]>(DAYS_OF_WEEK);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (open && editingMedication) {
      setName(editingMedication.name);
      setDosage(editingMedication.dosage || "");
      setFrequency(editingMedication.frequency);
      setMorningEnabled(!!editingMedication.times.morning);
      setLunchEnabled(!!editingMedication.times.lunch);
      setEveningEnabled(!!editingMedication.times.evening);
      setMorningTime(editingMedication.times.morning || "08:00");
      setLunchTime(editingMedication.times.lunch || "12:00");
      setEveningTime(editingMedication.times.evening || "20:00");
      setPrecautions(editingMedication.precautions || "");

      if (editingMedication.schedule) {
        setScheduleType(editingMedication.schedule.type);
        setRepeatDays(
          editingMedication.schedule.repeatDays || DAYS_OF_WEEK,
        );
        setStartDate(editingMedication.schedule.startDate || "");
        setEndDate(editingMedication.schedule.endDate || "");
      } else {
        resetFormSchedule();
      }
    } else if (open && !editingMedication) {
      resetForm();
    }
  }, [open, editingMedication]);

  const resetFormSchedule = () => {
    setScheduleType("repeat");
    setRepeatDays(DAYS_OF_WEEK);
    setStartDate("");
    setEndDate("");
  };

  const resetForm = () => {
    setName("");
    setDosage("");
    setFrequency("once");
    setMorningEnabled(false);
    setLunchEnabled(false);
    setEveningEnabled(false);
    setMorningTime("08:00");
    setLunchTime("12:00");
    setEveningTime("20:00");
    setPrecautions("");
    resetFormSchedule();
  };

  const toggleDay = (day: string) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const isValid =
    name.trim() &&
    (morningEnabled || lunchEnabled || eveningEnabled) &&
    (scheduleType !== "repeat" || repeatDays.length > 0) &&
    (scheduleType !== "period" || (startDate && endDate));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const times: Medication["times"] = {};
    if (morningEnabled) times.morning = morningTime;
    if (lunchEnabled) times.lunch = lunchTime;
    if (eveningEnabled) times.evening = eveningTime;

    const schedule: MedicationSchedule = {
      type: scheduleType,
      ...(scheduleType === "repeat" && { repeatDays }),
      ...(scheduleType === "period" && { startDate, endDate }),
      ...(scheduleType === "today" && {
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      }),
    };

    const medicationData = {
      name,
      dosage: dosage || undefined,
      frequency,
      times,
      precautions: precautions || undefined,
      schedule,
    };

    if (isEditing && editingMedication) {
      updateMedication(editingMedication.id, medicationData);
    } else {
      addMedication(medicationData);
    }

    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto rounded-xl bg-card shadow-lg border border-border">
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {isEditing ? "약 정보 수정" : "새 약 추가하기"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              약 이름 <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: Aspirin"
              required
            />
          </div>

          {/* Dosage */}
          <div className="space-y-2">
            <label
              htmlFor="dosage"
              className="text-sm font-medium text-foreground"
            >
              용량 (선택)
            </label>
            <Input
              id="dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="예: 500mg, 1정"
            />
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              복용 횟수 <span className="text-destructive">*</span>
            </p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value="once"
                  checked={frequency === "once"}
                  onChange={() => setFrequency("once")}
                  className="h-4 w-4 border border-input"
                />
                <span>1일 1회</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value="twice"
                  checked={frequency === "twice"}
                  onChange={() => setFrequency("twice")}
                  className="h-4 w-4 border border-input"
                />
                <span>1일 2회</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value="three_times"
                  checked={frequency === "three_times"}
                  onChange={() => setFrequency("three_times")}
                  className="h-4 w-4 border border-input"
                />
                <span>1일 3회</span>
              </label>
            </div>
          </div>

          {/* Times */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              복용 시간 <span className="text-destructive">*</span>
            </p>
            <div className="space-y-3">
              <TimeRow
                id="morning"
                label="아침"
                enabled={morningEnabled}
                onEnabledChange={setMorningEnabled}
                time={morningTime}
                onTimeChange={setMorningTime}
              />
              <TimeRow
                id="lunch"
                label="점심"
                enabled={lunchEnabled}
                onEnabledChange={setLunchEnabled}
                time={lunchTime}
                onTimeChange={setLunchTime}
              />
              <TimeRow
                id="evening"
                label="저녁"
                enabled={eveningEnabled}
                onEnabledChange={setEveningEnabled}
                time={eveningTime}
                onTimeChange={setEveningTime}
              />
            </div>
          </div>

          {/* Schedule Type */}
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4" />
              복용 기간 <span className="text-destructive">*</span>
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value="today"
                  checked={scheduleType === "today"}
                  onChange={() => setScheduleType("today")}
                  className="h-4 w-4 border border-input"
                />
                <span>오늘만</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value="repeat"
                  checked={scheduleType === "repeat"}
                  onChange={() => setScheduleType("repeat")}
                  className="h-4 w-4 border border-input"
                />
                <span>요일별 반복</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value="period"
                  checked={scheduleType === "period"}
                  onChange={() => setScheduleType("period")}
                  className="h-4 w-4 border border-input"
                />
                <span>특정 기간</span>
              </label>
            </div>

            {scheduleType === "repeat" && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  반복할 요일 선택
                </p>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "w-10 h-10 rounded-full text-sm font-medium transition-colors",
                        repeatDays.includes(day)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80",
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {scheduleType === "period" && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="startDate"
                    className="w-16 text-sm text-foreground"
                  >
                    시작일
                  </label>
                  <Input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="endDate"
                    className="w-16 text-sm text-foreground"
                  >
                    종료일
                  </label>
                  <Input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Precautions */}
          <div className="space-y-2">
            <label
              htmlFor="precautions"
              className="text-sm font-medium text-foreground"
            >
              주의사항 (선택)
            </label>
            <Input
              id="precautions"
              value={precautions}
              onChange={(e) => setPrecautions(e.target.value)}
              placeholder="복용 시 주의사항을 입력하세요"
            />
          </div>

          {/* Actions */}
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
      </div>
    </div>
  );
}

interface TimeRowProps {
  id: string;
  label: string;
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  time: string;
  onTimeChange: (value: string) => void;
}

function TimeRow({
  id,
  label,
  enabled,
  onEnabledChange,
  time,
  onTimeChange,
}: TimeRowProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="checkbox"
        checked={enabled}
        onChange={(e) => onEnabledChange(e.target.checked)}
        className="h-4 w-4 rounded border border-input"
      />
      <label
        htmlFor={id}
        className="font-normal cursor-pointer flex-1 text-sm text-foreground"
      >
        {label}
      </label>
      <Input
        type="time"
        value={time}
        onChange={(e) => onTimeChange(e.target.value)}
        disabled={!enabled}
        className="w-28"
      />
    </div>
  );
}

