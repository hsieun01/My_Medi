"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { toast } from "sonner";

export interface MedicationSchedule {
  type: "today" | "repeat" | "period";
  repeatDays?: string[]; // ["월", "화", "수", "목", "금", "토", "일"]
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency: "once" | "twice" | "three_times";
  times: {
    morning?: string;
    lunch?: string;
    evening?: string;
  };
  precautions?: string;
  schedule?: MedicationSchedule;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  date: string;
  time: string;
  taken: boolean;
  scheduledTime: string;
  period: "morning" | "lunch" | "evening";
}

export interface SavedItem {
  id: string;
  type: "disease" | "drug";
  targetId: string;
  savedAt: string;
  originalData?: {
    id: string;
    title: string;
    titleKo: string;
    description: string;
    medicalTerm?: string;
    [key: string]: any;
  };
}

interface MedicationContextType {
  supabase: any;
  user: User | null;
  isLoading: boolean;
  medications: Medication[];
  logs: MedicationLog[];
  savedItems: SavedItem[];
  addMedication: (medication: Omit<Medication, "id">) => Promise<void>;
  updateMedication: (id: string, medication: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  logMedication: (
    medicationId: string,
    period: "morning" | "lunch" | "evening",
  ) => Promise<void>;
  toggleSaveItem: (targetId: string, type: "disease" | "drug") => Promise<void>;
  removeSavedItem: (id: string) => Promise<void>;
  isSaved: (targetId: string) => boolean;
  getWeeklyStats: () => { day: string; rate: number }[];
  getTodayLogs: () => (MedicationLog & { medication: Medication })[];
}

const MedicationContext = createContext<MedicationContextType | undefined>(
  undefined,
);

export function MedicationProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    console.info("MedicationProvider: Initializing auth listener");

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("MedicationProvider: Initial session check:", session?.user?.id || "null");
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("MedicationProvider: Auth state change event:", event, session?.user?.id || "null");
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchData = useCallback(async () => {
    if (!user) {
      setMedications([]);
      setLogs([]);
      setSavedItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const todayStr = new Date().toISOString().split("T")[0];

    const [medsRes, logsRes, savedRes] = await Promise.all([
      supabase.from("medications").select("*").order("created_at", { ascending: true }),
      supabase.from("medication_logs").select("*").eq("taken_date", todayStr),
      supabase.from("saved_items").select("*").order("created_at", { ascending: false }),
    ]);

    if (!medsRes.error) {
      setMedications(medsRes.data.map(m => ({
        ...m,
        times: m.times || {},
        schedule: m.schedule || {}
      })) as any);
    }

    if (!logsRes.error) {
      setLogs(logsRes.data.map(l => ({
        id: l.id,
        medicationId: l.medication_id,
        date: l.taken_date,
        time: l.taken_at ? new Date(l.taken_at).toTimeString().slice(0, 5) : "",
        taken: l.taken,
        scheduledTime: l.scheduled_time.slice(0, 5),
        period: l.period
      })) as any);
    }

    if (savedRes.error) {
      console.error("Fetch Saved Items Error:", savedRes.error);
    }

    if (!savedRes.error && savedRes.data) {
      console.log("Fetched saved items from DB:", savedRes.data.length);
      const savedData = savedRes.data;
      const diseaseIds = savedData.filter(s => s.type === "disease").map(s => s.target_id);
      const drugIds = savedData.filter(s => s.type === "drug").map(s => s.target_id);

      const [diseasesRes, drugsRes] = await Promise.all([
        diseaseIds.length > 0 ? supabase.from("diseases").select("*").in("id", diseaseIds) : Promise.resolve({ data: [] }),
        drugIds.length > 0 ? supabase.from("drugs").select("*").in("id", drugIds) : Promise.resolve({ data: [] }),
      ]);

      const diseasesMap = new Map((diseasesRes.data || []).map(d => [d.id, d]));
      const drugsMap = new Map((drugsRes.data || []).map(d => [d.id, d]));

      const mappedItems = savedData.map(s => ({
        id: s.id,
        type: s.type,
        targetId: s.target_id,
        savedAt: s.created_at,
        originalData: s.type === "disease"
          ? diseasesMap.get(s.target_id)
          : drugsMap.get(s.target_id)
      })).filter(s => s.originalData);

      console.log("Mapped saved items:", mappedItems.length);
      setSavedItems(mappedItems as any);
    }

    setIsLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addMedication = useCallback(async (medication: Omit<Medication, "id">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("medications")
        .insert({
          user_id: user.id,
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          times: medication.times,
          precautions: medication.precautions,
          schedule: medication.schedule
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setMedications((prev) => [...prev, data as any]);
        toast.success(`${medication.name} 약이 추가되었습니다.`);
      }
    } catch (error) {
      console.error("Add Medication Error:", error);
      toast.error("약 추가 중 오류가 발생했습니다.");
    }
  }, [supabase, user]);

  const updateMedication = useCallback(
    async (id: string, updates: Partial<Medication>) => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("medications")
          .update({
            name: updates.name,
            dosage: updates.dosage,
            frequency: updates.frequency,
            times: updates.times,
            precautions: updates.precautions,
            schedule: updates.schedule
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setMedications((prev) =>
            prev.map((med) => (med.id === id ? { ...med, ...data } : med)),
          );
          toast.success("약 정보가 수정되었습니다.");
        }
      } catch (error) {
        console.error("Update Medication Error:", error);
        toast.error("약 수정 중 오류가 발생했습니다.");
      }
    },
    [supabase, user],
  );

  const deleteMedication = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("medications").delete().eq("id", id);
      if (error) throw error;

      setMedications((prev) => prev.filter((med) => med.id !== id));
      setLogs((prev) => prev.filter((log) => log.medicationId !== id));
      toast.success("약이 삭제되었습니다.");
    } catch (error) {
      console.error("Delete Medication Error:", error);
      toast.error("약 삭제 중 오류가 발생했습니다.");
    }
  }, [supabase, user]);

  const logMedication = useCallback(
    async (medicationId: string, period: "morning" | "lunch" | "evening") => {
      if (!user) return;

      const medication = medications.find((m) => m.id === medicationId);
      if (!medication) return;

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const scheduledTime = medication.times[period] || "00:00";

      const existingLog = logs.find(
        (log) =>
          log.medicationId === medicationId &&
          log.date === todayStr &&
          log.period === period,
      );

      const isTaken = existingLog ? !existingLog.taken : true;

      // --- Optimistic Update ---
      const optimisticLogId = existingLog?.id || `temp-${Date.now()}`;
      const originalLogs = [...logs];

      setLogs((prev) => {
        if (existingLog) {
          return prev.map((l) =>
            l.id === existingLog.id ? { ...l, taken: isTaken, time: isTaken ? now.toTimeString().slice(0, 5) : "" } : l
          );
        } else {
          return [...prev, {
            id: optimisticLogId,
            medicationId,
            date: todayStr,
            time: now.toTimeString().slice(0, 5),
            taken: true,
            scheduledTime,
            period
          }];
        }
      });
      // -------------------------

      try {
        const { data, error } = await supabase
          .from("medication_logs")
          .upsert({
            id: (typeof optimisticLogId === 'string' && optimisticLogId.startsWith('temp-')) ? undefined : existingLog?.id,
            medication_id: medicationId,
            taken_date: todayStr,
            period,
            scheduled_time: scheduledTime,
            taken: isTaken,
            taken_at: isTaken ? now.toISOString() : null,
          }, { onConflict: 'id' })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const syncedLog: MedicationLog = {
            id: data.id,
            medicationId: data.medication_id,
            date: data.taken_date,
            time: data.taken_at ? new Date(data.taken_at).toTimeString().slice(0, 5) : "",
            taken: data.taken,
            scheduledTime: data.scheduled_time.slice(0, 5),
            period: data.period as any
          };

          setLogs((prev) => prev.map((l) =>
            (l.id === optimisticLogId || l.id === data.id) ? syncedLog : l
          ));
        }

        toast.success(isTaken ? "복약이 체크되었습니다." : "복약 체크가 해제되었습니다.");
      } catch (error) {
        console.error("Log Medication Error:", error);
        setLogs(originalLogs); // Revert
        toast.error("복약 상태 변경 중 오류가 발생했습니다.");
      }
    },
    [supabase, user, medications, logs],
  );

  const toggleSaveItem = useCallback(
    async (targetId: string, type: "disease" | "drug") => {
      console.log("toggleSaveItem called:", { targetId, type });

      let currentUser = user;

      // Fallback: Check direct Supabase session if local state is null
      if (!currentUser) {
        console.log("toggleSaveItem: User state is null, checking direct session...");
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          console.log("toggleSaveItem: Found user in direct session:", supabaseUser.id);
          setUser(supabaseUser);
          currentUser = supabaseUser;
        }
      }

      console.log("toggleSaveItem execution user:", currentUser ? currentUser.id : "null");

      if (!currentUser) {
        console.error("toggleSaveItem: No authenticated user found even after fallback");
        toast.error("로그인이 필요한 기능입니다.");
        return;
      }

      const existingBookmark = savedItems.find(
        (item) => item.targetId === targetId && item.type === type
      );
      console.log("Existing bookmark check:", !!existingBookmark);

      // --- Optimistic Update ---
      const originalSavedItems = [...savedItems];
      if (existingBookmark) {
        console.log("Removing bookmark optimistically");
        setSavedItems((prev) => prev.filter((item) => item.targetId !== targetId));
      } else {
        console.log("Adding bookmark optimistically");
        setSavedItems((prev) => [
          {
            id: "temp-" + Date.now(),
            type,
            targetId,
            savedAt: new Date().toISOString(),
            originalData: {} // Placeholder to satisfy isSaved check and filter
          } as any,
          ...prev,
        ]);
      }
      // -------------------------

      try {
        if (existingBookmark) {
          const { error } = await supabase
            .from("saved_items")
            .delete()
            .eq("id", existingBookmark.id);
          if (error) throw error;
          toast.success("북마크가 해제되었습니다.");
        } else {
          const { data, error } = await supabase
            .from("saved_items")
            .insert({
              user_id: currentUser.id, // Use currentUser from fallback
              type,
              target_id: targetId,
            })
            .select()
            .single();

          if (error) throw error;
          console.log("Bookmark inserted into DB:", data.id);
          // Refresh data to get original details for My Page
          fetchData();
          toast.success("북마크에 추가되었습니다.");
        }
      } catch (error) {
        console.error("Toggle Save Item Error:", error);
        setSavedItems(originalSavedItems);
        toast.error("처리 중 오류가 발생했습니다.");
      }
    },
    [supabase, user, savedItems, fetchData]
  );

  const removeSavedItem = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("saved_items").delete().eq("id", id);
      if (error) throw error;

      setSavedItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("북마크가 해제되었습니다.");
    } catch (error) {
      console.error("Remove Saved Item Error:", error);
      toast.error("정보 해제 중 오류가 발생했습니다.");
    }
  }, [supabase, user]);

  const isSaved = useCallback(
    (targetId: string) => {
      return savedItems.some((item) => item.targetId === targetId);
    },
    [savedItems],
  );

  const isMedicationScheduledForDate = useCallback((med: Medication, date: Date) => {
    if (!med.schedule) return true;
    const { type, repeatDays, startDate, endDate } = med.schedule;
    const dateStr = date.toISOString().split("T")[0];

    if (type === "today") {
      return dateStr === startDate;
    }

    if (type === "period") {
      if (!startDate || !endDate) return true;
      return dateStr >= startDate && dateStr <= endDate;
    }

    if (type === "repeat") {
      if (!repeatDays || repeatDays.length === 0) return true;
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      const dayName = days[date.getDay()];
      return repeatDays.includes(dayName);
    }

    return true;
  }, []);

  const getWeeklyStats = useCallback(() => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const stats: { day: string; rate: number }[] = [];

    // Note: This is simplified for the current local logs state.
    // In a real app, logs for the last 7 days might need to be fetched separately.
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = days[date.getDay()];

      let expectedDoses = 0;
      medications.forEach((med) => {
        if (isMedicationScheduledForDate(med, date)) {
          if (med.times.morning) expectedDoses++;
          if (med.times.lunch) expectedDoses++;
          if (med.times.evening) expectedDoses++;
        }
      });

      // This logic assumes `logs` contains logs for all 7 days, 
      // which might not be true if fetchData only fetches today's logs.
      // For now, we'll keep it as is, but it's a point for Phase 4 polish.
      const takenDoses = logs.filter(
        (log) => log.date === dateStr && log.taken,
      ).length;

      const rate =
        expectedDoses > 0
          ? Math.round((takenDoses / expectedDoses) * 100)
          : 0;
      stats.push({ day: dayName, rate });
    }

    return stats;
  }, [medications, logs, isMedicationScheduledForDate]);

  const getTodayLogs = useCallback(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const todayLogs: (MedicationLog & { medication: Medication })[] = [];

    medications.forEach((med) => {
      if (!isMedicationScheduledForDate(med, today)) return;

      const periods: ("morning" | "lunch" | "evening")[] = [
        "morning",
        "lunch",
        "evening",
      ];
      periods.forEach((period) => {
        if (med.times[period]) {
          const existingLog = logs.find(
            (log) =>
              log.medicationId === med.id &&
              log.date === todayStr &&
              log.period === period,
          );
          if (existingLog) {
            todayLogs.push({ ...existingLog, medication: med });
          } else {
            todayLogs.push({
              id: `pending-${med.id}-${period}`,
              medicationId: med.id,
              date: todayStr,
              time: "",
              taken: false,
              scheduledTime: med.times[period]!,
              period,
              medication: med,
            });
          }
        }
      });
    });

    return todayLogs.sort((a, b) =>
      a.scheduledTime.localeCompare(b.scheduledTime),
    );
  }, [medications, logs, isMedicationScheduledForDate]);

  return (
    <MedicationContext.Provider
      value={{
        supabase,
        user,
        isLoading,
        medications,
        logs,
        savedItems,
        addMedication,
        updateMedication,
        deleteMedication,
        logMedication,
        toggleSaveItem,
        removeSavedItem,
        isSaved,
        getWeeklyStats,
        getTodayLogs,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
}

export function useMedication() {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error("useMedication must be used within a MedicationProvider");
  }
  return context;
}

