"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface MedicationSchedule {
  type: "today" | "repeat" | "period"
  repeatDays?: string[] // ["월", "화", "수", "목", "금", "토", "일"]
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
}

export interface Medication {
  id: string
  name: string
  dosage?: string
  frequency: "once" | "twice" | "three_times"
  times: {
    morning?: string
    lunch?: string
    evening?: string
  }
  precautions?: string
  schedule?: MedicationSchedule
}

export interface MedicationLog {
  id: string
  medicationId: string
  date: string
  time: string
  taken: boolean
  scheduledTime: string
  period: "morning" | "lunch" | "evening"
}

export interface SavedItem {
  id: string
  type: "disease" | "drug"
  title: string
  titleKo?: string
  description: string
  aiExplanation?: string
  savedAt: string
}

interface MedicationContextType {
  medications: Medication[]
  logs: MedicationLog[]
  savedItems: SavedItem[]
  addMedication: (medication: Omit<Medication, "id">) => void
  updateMedication: (id: string, medication: Partial<Medication>) => void
  deleteMedication: (id: string) => void
  logMedication: (medicationId: string, period: "morning" | "lunch" | "evening") => void
  saveItem: (item: Omit<SavedItem, "id" | "savedAt">) => void
  removeSavedItem: (id: string) => void
  removeSavedItemByTitle: (title: string) => void
  isSaved: (title: string) => boolean
  getWeeklyStats: () => { day: string; rate: number }[]
  getTodayLogs: () => (MedicationLog & { medication: Medication })[]
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined)

// Sample data for demonstration
const sampleMedications: Medication[] = [
  {
    id: "1",
    name: "Aspirin",
    dosage: "100mg",
    frequency: "once",
    times: { morning: "08:00" },
    precautions: "식사 후 복용하세요. 위장 장애가 있을 수 있습니다.",
    schedule: { type: "repeat", repeatDays: ["월", "화", "수", "목", "금"] }
  },
  {
    id: "2",
    name: "Metformin",
    dosage: "500mg",
    frequency: "twice",
    times: { morning: "08:00", lunch: "12:00" },
    precautions: "신장 기능을 정기적으로 확인하세요.",
    schedule: { type: "period", startDate: "2026-02-01", endDate: "2026-02-28" }
  },
  {
    id: "3",
    name: "Statin",
    dosage: "20mg",
    frequency: "once",
    times: { evening: "20:00" },
    precautions: "저녁 식사 후 복용하면 효과가 좋습니다.",
    schedule: { type: "repeat", repeatDays: ["월", "화", "수", "목", "금", "토", "일"] }
  }
]

const today = new Date().toISOString().split("T")[0]
const sampleLogs: MedicationLog[] = [
  {
    id: "log1",
    medicationId: "1",
    date: today,
    time: "08:05",
    taken: true,
    scheduledTime: "08:00",
    period: "morning"
  }
]

const sampleSavedItems: SavedItem[] = [
  {
    id: "saved1",
    type: "disease",
    title: "Hypertension",
    titleKo: "고혈압",
    description: "혈압이 정상 범위보다 지속적으로 높은 상태입니다.",
    aiExplanation: "심장이 피를 보낼 때 혈관에 가해지는 압력이 정상보다 높은 상태예요. 쉽게 말해 혈관 벽에 무리가 가는 거죠.",
    savedAt: "2026-02-01T10:00:00Z"
  },
  {
    id: "saved2",
    type: "drug",
    title: "Aspirin",
    titleKo: "아스피린",
    description: "혈액 응고를 억제하는 약물입니다.",
    savedAt: "2026-02-02T14:30:00Z"
  }
]

export function MedicationProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>(sampleMedications)
  const [logs, setLogs] = useState<MedicationLog[]>(sampleLogs)
  const [savedItems, setSavedItems] = useState<SavedItem[]>(sampleSavedItems)

  const addMedication = useCallback((medication: Omit<Medication, "id">) => {
    const newMedication: Medication = {
      ...medication,
      id: Date.now().toString()
    }
    setMedications(prev => [...prev, newMedication])
  }, [])

  const updateMedication = useCallback((id: string, updates: Partial<Medication>) => {
    setMedications(prev =>
      prev.map(med => (med.id === id ? { ...med, ...updates } : med))
    )
  }, [])

  const deleteMedication = useCallback((id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id))
    setLogs(prev => prev.filter(log => log.medicationId !== id))
  }, [])

  const logMedication = useCallback((medicationId: string, period: "morning" | "lunch" | "evening") => {
    const medication = medications.find(m => m.id === medicationId)
    if (!medication) return

    const now = new Date()
    const todayStr = now.toISOString().split("T")[0]
    const timeStr = now.toTimeString().slice(0, 5)

    const existingLog = logs.find(
      log => log.medicationId === medicationId && log.date === todayStr && log.period === period
    )

    if (existingLog) {
      setLogs(prev =>
        prev.map(log =>
          log.id === existingLog.id ? { ...log, taken: !log.taken, time: timeStr } : log
        )
      )
    } else {
      const scheduledTime = medication.times[period] || "00:00"
      const newLog: MedicationLog = {
        id: Date.now().toString(),
        medicationId,
        date: todayStr,
        time: timeStr,
        taken: true,
        scheduledTime,
        period
      }
      setLogs(prev => [...prev, newLog])
    }
  }, [medications, logs])

  const saveItem = useCallback((item: Omit<SavedItem, "id" | "savedAt">) => {
    const newItem: SavedItem = {
      ...item,
      id: Date.now().toString(),
      savedAt: new Date().toISOString()
    }
    setSavedItems(prev => [...prev, newItem])
  }, [])

  const removeSavedItem = useCallback((id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const removeSavedItemByTitle = useCallback((title: string) => {
    setSavedItems(prev => prev.filter(item => item.title !== title))
  }, [])

  const isSaved = useCallback((title: string) => {
    return savedItems.some(item => item.title === title)
  }, [savedItems])

  const getWeeklyStats = useCallback(() => {
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    const stats: { day: string; rate: number }[] = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayName = days[date.getDay()]
      
      // Count expected doses for the day
      let expectedDoses = 0
      medications.forEach(med => {
        if (med.times.morning) expectedDoses++
        if (med.times.lunch) expectedDoses++
        if (med.times.evening) expectedDoses++
      })
      
      // Count taken doses for the day
      const takenDoses = logs.filter(log => log.date === dateStr && log.taken).length
      
      const rate = expectedDoses > 0 ? Math.round((takenDoses / expectedDoses) * 100) : 0
      stats.push({ day: dayName, rate })
    }
    
    return stats
  }, [medications, logs])

  const getTodayLogs = useCallback(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    const todayLogs: (MedicationLog & { medication: Medication })[] = []

    medications.forEach(med => {
      const periods: ("morning" | "lunch" | "evening")[] = ["morning", "lunch", "evening"]
      periods.forEach(period => {
        if (med.times[period]) {
          const existingLog = logs.find(
            log => log.medicationId === med.id && log.date === todayStr && log.period === period
          )
          if (existingLog) {
            todayLogs.push({ ...existingLog, medication: med })
          } else {
            todayLogs.push({
              id: `pending-${med.id}-${period}`,
              medicationId: med.id,
              date: todayStr,
              time: "",
              taken: false,
              scheduledTime: med.times[period]!,
              period,
              medication: med
            })
          }
        }
      })
    })

    return todayLogs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
  }, [medications, logs])

  return (
    <MedicationContext.Provider
      value={{
        medications,
        logs,
        savedItems,
        addMedication,
        updateMedication,
        deleteMedication,
        logMedication,
        saveItem,
        removeSavedItem,
        removeSavedItemByTitle,
        isSaved,
        getWeeklyStats,
        getTodayLogs
      }}
    >
      {children}
    </MedicationContext.Provider>
  )
}

export function useMedication() {
  const context = useContext(MedicationContext)
  if (context === undefined) {
    throw new Error("useMedication must be used within a MedicationProvider")
  }
  return context
}
