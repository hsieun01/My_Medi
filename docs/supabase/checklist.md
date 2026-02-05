# My-Medi 구현 상세 체크리스트 (Architect's Edition - v2)

시니어 아키텍트의 관점에서 `_mockup` 설계와 PRD를 병합하여 작성한 **데이터 바인딩 및 사용자 플로우 중심** 구현 가이드입니다.

---

## Phase 1: Foundation & Onboarding 🔴
*사용자의 서비스 진입부터 데이터 소유권 확립까지의 흐름을 처리합니다.*

### 1.1 Auth Lifecycle & Onboarding Flow [ ]
- **Data Flow**: `Supabase Auth → Welcome Page → Role/Profile Setting → medications (Initialize)`
- **1.1.1** [Next.js Middleware] 세션 유무에 따라 `/login` 또는 `/welcome`으로 리다이렉트 처리 [ ]
- **1.1.2** [Onboarding] `app/(auth)/onboarding`에서 수집된 유저 초기 프로필 정보를 `auth.users` 메타데이터 또는 별도 프로필 테이블에 바인딩 [ ]
- **1.1.3** [Client Client] `supabase.auth.onAuthStateChange` 이벤트를 `MedicationContext`와 동기화하여 로그인 시점에 데이터 Fetch 트리거 [ ]

---

## Phase 2: Core Logic - Medication Management 🔴
*복약 정보의 등록, 수정, 삭제 및 복잡한 스케줄링 로직을 처리합니다.*

### 2.1 Medication CRUD Flow [ ]
- **Data Flow**: `Form State (AddModal) → Server Action (Upsert) → medications Table → Context Update (Optimistic UI)`
- **2.1.1** [Create] `add-medication-modal.tsx`의 요일 반복(`repeatDays`), 기간 설정(`startDate/EndDate`) 로직을 `medications.schedule` JSONB 필드로 매핑하여 저장 [ ]
- **2.1.2** [Read] `medications` 테이블 인덱싱(`user_id`, `created_at`)을 활용한 고속 페칭 및 상태 관리 [ ]
- **2.1.3** [Update] 마이페이지 내 수정 버튼 클릭 시 기존 데이터를 Modal 폼으로 Prefill(데이터 바인딩) 및 `patch` 방식 업데이트 [ ]

### 2.2 Dashboard Scheduling Engine [ ]
- **Data Flow**: `medications` (설정) + `medication_logs` (실행) + `currentDate` → `Dashboard List`
- **2.2.1** [Logic] 오늘 날짜가 요일 반복군(`repeatDays`)에 속하는지, 또는 기간(`period`) 내에 있는지 판단하는 유틸리티 함수 구현 [ ]
- **2.2.2** [Data Binding] 아침/점심/저녁 각 시간대별로 `medications`의 `times` 필드를 순회하며 `MedicationCard` 인스턴스 생성 [ ]
- **2.2.3** [Persistence] `MedicationCard` 체크 시 `medication_logs.taken` 필드를 토글. 이때 `taken_at`은 `now()`로 기록 [ ]

---

## Phase 3: Knowledge Interaction (Search & AI) 🟡
*정적 의료 데이터 검색과 AI를 통한 정보 가공 및 저장 흐름을 처리합니다.*

### 3.1 Advanced Search Flow [ ]
- **Data Flow**: `Search Query → diseases/drugs (Select) → Tabs Content → Bookmark State Check`
- **3.1.1** [Tabs] `diseases`와 `drugs` 테이블을 각각 쿼리하거나, 통합 검색 뷰(Materialized View)를 통한 결과 반환 [ ]
- **3.1.2** [Bookmark Sync] 검색 결과 리스트 렌더링 시 `saved_items` 테이블을 `target_id`로 조회하여 "이미 저장됨(Star)" 상태 표시 [ ]

### 3.2 AI Contextual Logic [ ]
- **Data Flow**: `Medical Term (Source) → OpenAI API (Simplify) → ai_explanations (Cache) → Chat UI`
- **3.2.1** [Explanation] AI 설명 요청 시 `ai_explanations` 테이블 히트 테스트 후, 미적중 시에만 API 호출하는 **Write-through Cache** 전략 구현 [ ]
- **3.2.2** [Interactive Chat] `SearchPage` 내 대화창에서 사용자 질문과 원본 도메인 지식(Medical Term)을 함께 AI에 전달하여 맥락에 맞는 답변 생성 [ ]

---

## Phase 4: Feedback & History (Data Visualization) 🟡
*데이터 축적에 따른 사용자 복약 성취도를 시각화합니다.*

### 4.1 Stats Calculation Flow [ ]
- **Data Flow**: `medication_logs (Daily) → count/filter (Logic) → ProgressBar & BarChart`
- **4.1.1** [Weekly Stats] `date_trunc` 함수를 사용한 주간 복약 성공률 데이터 통계 쿼리 구현 [ ]
- **4.1.2** [Visual Binding] 계산된 성공률(`averageRate`)을 Dashboard의 `ProgressBar` 컴포넌트 Props로 실시간 주입 [ ]

---

## Phase 5: Reliability & Optimization 🟢
*시스템의 안정성과 실제 서비스 수준의 품질을 확보합니다.*

- **5.1** [Security] RLS Policy가 `INSERT/UPDATE` 시에도 `check (auth.uid() = user_id)`를 강제하도록 보안 강화 [ ]
- **5.2** [Error Handling] Supabase 쿼리 실패 시 사용자에게 알리는 `Toast` 피드백 연동 [ ]
- **5.3** [UX] `useOptimistic` 훅을 활용하여 복약 체크 시 서버 응답 대기 없이 즉각적인 UI 변경 적용 [ ]

---

## 구현 우선순위 및 요약
1.  🔴 **필수(Step 1-2)**: 인증 연동, 복약 등록(CRUD), 대시보드 스케줄링 바인딩. 프로젝트의 Core 가치.
2.  🟡 **확장(Step 3-4)**: AI 쉬운 설명, 검색 및 북마크, 주간 통계. 차별화된 사용자 경험 제공.
3.  🟢 **완성(Step 5)**: 성능 최적화, 보안 검증, 애니메이션 등 디테일 작업.

## 핵심 기술 스택
- **Database**: Supabase PostgreSQL (JSONB for schedules)
- **Logic Layer**: Next.js Server Actions & React Context (State Management)
- **AI**: OpenAI GPT-4 mini (Rewrite & Chat)
- **Visualization**: Recharts (History View)
