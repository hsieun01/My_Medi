-- Supabase SQL Schema for My-Medi

-- 1. Medications Table
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT CHECK (frequency IN ('once', 'twice', 'three_times')),
  times JSONB NOT NULL DEFAULT '{}'::jsonb, -- { morning, lunch, evening }
  precautions TEXT,
  schedule JSONB NOT NULL DEFAULT '{}'::jsonb, -- { type, repeatDays, startDate, endDate }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Medication Logs Table
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  taken_date DATE NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('morning', 'lunch', 'evening')),
  scheduled_time TIME NOT NULL,
  taken BOOLEAN NOT NULL DEFAULT false,
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Diseases Table (Static Data)
CREATE TABLE diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ko TEXT NOT NULL,
  description TEXT,
  medical_term TEXT,
  common_symptoms TEXT[],
  emergency_hint TEXT
);

-- 4. Drugs Table (Static Data)
CREATE TABLE drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ko TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  precaution TEXT,
  medical_term TEXT
);

-- 5. Saved Items Table
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('disease', 'drug')),
  target_id UUID NOT NULL,
  title TEXT,
  title_ko TEXT,
  description TEXT,
  ai_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. AI Explanations Table (Cache)
CREATE TABLE ai_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('disease', 'drug')),
  target_id UUID NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
-- Static tables usually allow select all, or specific roles. Here we allow all authenticated users to read.
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_explanations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Medications
CREATE POLICY "Users can manage their own medications"
ON medications FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Medication Logs (via medication_id lookup)
CREATE POLICY "Users can manage their own medication logs"
ON medication_logs FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM medications
    WHERE medications.id = medication_logs.medication_id
    AND medications.user_id = auth.uid()
  )
);

-- Saved Items
CREATE POLICY "Users can manage their own saved items"
ON saved_items FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Static Data (Read-only for all authenticated users)
CREATE POLICY "Anyone can read diseases" ON diseases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read drugs" ON drugs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read AI explanations" ON ai_explanations FOR SELECT TO authenticated USING (true);
