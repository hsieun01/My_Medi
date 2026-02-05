export type Frequency = 'once' | 'twice' | 'three_times';
export type Period = 'morning' | 'lunch' | 'evening';
export type ScheduleType = 'today' | 'repeat' | 'period';

export interface MedicationSchedule {
    type: ScheduleType;
    repeatDays?: string[]; // ["월", "화", "수", "목", "금", "토", "일"]
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
}

export interface Medication {
    id: string;
    user_id: string;
    name: string;
    dosage?: string;
    frequency: Frequency;
    times: {
        morning?: string;
        lunch?: string;
        evening?: string;
    };
    precautions?: string;
    schedule: MedicationSchedule;
    created_at: string;
}

export interface MedicationLog {
    id: string;
    medication_id: string;
    taken_date: string;
    period: Period;
    scheduled_time: string;
    taken: boolean;
    taken_at?: string;
    created_at: string;
}

export interface Disease {
    id: string;
    title: string;
    title_ko: string;
    description?: string;
    medical_term?: string;
    common_symptoms?: string[];
    emergency_hint?: string;
}

export interface Drug {
    id: string;
    title: string;
    title_ko: string;
    description?: string;
    purpose?: string;
    precaution?: string;
    medical_term?: string;
}

export interface SavedItem {
    id: string;
    user_id: string;
    type: 'disease' | 'drug';
    target_id: string;
    title?: string;
    title_ko?: string;
    description?: string;
    ai_explanation?: string;
    created_at: string;
}

export interface AiExplanation {
    id: string;
    target_type: 'disease' | 'drug';
    target_id: string;
    content: string;
    model?: string;
    created_at: string;
}
