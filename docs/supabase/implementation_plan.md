# Implementation Plan - Supabase DB Schema Design

## Goal Description
Analyze the current UI and PRD to design an optimal Supabase database schema that supports medication management, disease/drug information search, and saved bookmarks.

## User Review Required
> [!IMPORTANT]
> - The `medications` and `medication_logs` tables will use a structure that matches the complex scheduling logic found in `MedicationContext`.
> - RLS (Row Level Security) policies will be strictly applied to ensure users can only access their own data.
> - `types/index.ts` will be created if it doesn't exist, or updated to match the new schema.

## Proposed Changes

### Supabase Database Schema [NEW]

#### 1. `medications` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Unique ID |
| `user_id` | uuid (FK) | References `auth.users.id` |
| `name` | text | Name of the medication |
| `dosage` | text | dosage info (e.g. 500mg) |
| `frequency` | text | `once`, `twice`, `three_times` |
| `times` | jsonb | `{ morning: "08:00", ... }` |
| `precautions` | text | Notes & precautions |
| `schedule` | jsonb | `{ type: "repeat", repeatDays: [...], ... }` |
| `created_at` | timestamptz | Creation time |

#### 2. `medication_logs` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Unique ID |
| `medication_id` | uuid (FK) | References `medications.id` |
| `taken_date` | date | Date of intake |
| `period` | text | `morning`, `lunch`, `evening` |
| `scheduled_time` | time | Scheduled intake time |
| `taken` | boolean | Whether it was taken |
| `taken_at` | timestamptz | Check-in time |

#### 3. `diseases` Table (Static Data)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Unique ID |
| `title` | text | English title |
| `title_ko` | text | Korean title |
| `description` | text | Detailed description |
| `medical_term` | text | Medical jargon explanation |
| `common_symptoms` | text[] | List of symptoms |
| `emergency_hint` | text | Critical warning notes |

#### 4. `drugs` Table (Static Data)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Unique ID |
| `title` | text | English title |
| `title_ko` | text | Korean title |
| `description` | text | Detailed description |
| `purpose` | text | Usage purpose |
| `precaution` | text | Critical warnings |
| `medical_term` | text | Medical jargon explanation |

#### 5. `saved_items` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Unique ID |
| `user_id` | uuid (FK) | References `auth.users.id` |
| `type` | text | `disease` or `drug` |
| `target_id` | uuid | References `diseases.id` or `drugs.id` |
| `title` | text | Denormalized title |
| `title_ko` | text | Denormalized Korean title |
| `description` | text | Denormalized description |
| `ai_explanation` | text | Denormalized AI explanation |
| `created_at` | timestamptz | Saved time |

#### 6. `ai_explanations` Table (Cache)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Unique ID |
| `target_type" | text | `disease` or `drug` |
| `target_id` | uuid | References original ID |
| `content` | text | AI rewritten easy explanation |
| `model` | text | AI model used (e.g. gpt-4) |
| `created_at` | timestamptz | Cache time |

### TypeScript Types

#### [NEW] [index.ts](file:///c:/user/gw_root/types/index.ts)
Update existing types (if any) or create new ones to match the DB schema precisely.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure no type errors in the current project or after type updates.
- Check for existing lint errors: `npm run lint`.

### Manual Verification
- Visual inspection of the generated SQL for RLS correctness (User ID isolation).
- Verify that the schema supports all fields found in `add-medication-modal.tsx` and `search/page.tsx`.
- Suggest user to apply the SQL in Supabase SQL Editor and test the connection.
