# My-Medi Flow Documentation

## 프로젝트 개요
My-Medi는 질환·약 정보를 쉽게 이해하고, 매일의 개인 복약을 기록·관리할 수 있는 AI 기반 복약 관리 웹 서비스입니다.

---

## 1. 전체 서비스 아키텍처

```mermaid
flowchart TB
    subgraph Client["클라이언트 (Next.js 14)"]
        UI[UI Components]
        Pages[Pages/Routes]
        Actions[Server Actions]
    end
    
    subgraph Supabase["Supabase Backend"]
        Auth[Auth Service]
        DB[(PostgreSQL)]
        RLS[Row Level Security]
    end
    
    subgraph External["외부 서비스"]
        OpenAI[OpenAI API]
    end
    
    User([사용자]) --> UI
    UI --> Pages
    Pages --> Actions
    Actions --> Auth
    Actions --> DB
    DB --> RLS
    Actions --> OpenAI
    
    style Client fill:#e3f2fd
    style Supabase fill:#fff3e0
    style External fill:#f3e5f5
```

---

## 2. 사용자 인증 플로우

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js Web
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    %% 회원가입 플로우
    rect rgb(200, 230, 255)
        note right of User: 회원가입 플로우
        User->>Web: 회원가입 페이지 접근
        User->>Web: 이메일, 비밀번호 입력
        Web->>Web: 클라이언트 유효성 검사
        Web->>Auth: signUp() 호출
        Auth->>DB: users 테이블에 데이터 생성
        Auth->>User: 인증 이메일 발송
        Auth-->>Web: 회원가입 성공
        Web-->>User: 이메일 인증 안내 페이지
        User->>Auth: 이메일 링크 클릭
        Auth-->>Web: 인증 완료, 리다이렉트
        Web-->>User: 온보딩 페이지 표시
    end

    %% 로그인 플로우
    rect rgb(200, 255, 200)
        note right of User: 로그인 플로우
        User->>Web: 로그인 페이지 접근
        User->>Web: 이메일, 비밀번호 입력
        Web->>Auth: signInWithPassword() 호출
        Auth->>DB: 사용자 확인
        Auth-->>Web: 세션 토큰 발급
        Web-->>User: 메인 대시보드로 리다이렉트
    end

    %% 소셜 로그인
    rect rgb(255, 230, 200)
        note right of User: 소셜 로그인 (Google)
        User->>Web: Google 로그인 클릭
        Web->>Auth: signInWithOAuth({provider: 'google'})
        Auth->>User: Google 동의 화면으로 리다이렉트
        User->>Auth: Google 인증 완료
        Auth->>DB: 사용자 데이터 생성/업데이트
        Auth-->>Web: 콜백 with 토큰
        Web-->>User: 메인 대시보드로 리다이렉트
    end
```

---

## 3. 메인 대시보드 플로우 (오늘 복약 관리)

```mermaid
flowchart TD
    Start([사용자 로그인]) --> LoadDashboard[메인 대시보드 로드]
    
    LoadDashboard --> FetchMeds[복용약 목록 조회]
    FetchMeds --> CheckToday{오늘 날짜<br/>복약 기록 존재?}
    
    CheckToday -->|없음| CreateLogs[medication_logs<br/>생성]
    CheckToday -->|있음| LoadLogs[기존 기록 로드]
    CreateLogs --> DisplayList
    LoadLogs --> DisplayList[오늘 복약 리스트 표시]
    
    DisplayList --> UserAction{사용자 액션}
    
    UserAction -->|복용 체크| CheckMed[복용 완료 표시]
    UserAction -->|주의사항 보기| ShowWarning[주의사항 모달]
    UserAction -->|새 약 추가| AddMed[약 추가 모달]
    
    CheckMed --> UpdateDB[(medication_logs<br/>UPDATE)]
    UpdateDB --> UpdateUI[UI 업데이트]
    UpdateUI --> CalcSuccess[성공률 재계산]
    
    ShowWarning --> DisplayList
    
    AddMed --> ValidateForm{폼 유효성<br/>검사}
    ValidateForm -->|실패| ShowError[에러 메시지]
    ValidateForm -->|성공| SaveMed[(medications<br/>INSERT)]
    ShowError --> AddMed
    SaveMed --> DisplayList
    
    CalcSuccess --> UpdateChart[차트 업데이트]
    UpdateChart --> DisplayList
    
    style LoadDashboard fill:#90EE90
    style CheckMed fill:#90EE90
    style UpdateDB fill:#87CEEB
    style SaveMed fill:#87CEEB
```

---

## 4. 질환·약 정보 탐색 및 AI 설명 플로우

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js Web
    participant DB as Supabase DB
    participant AI as OpenAI API
    participant SaveDB as saved_items

    %% 정보 검색
    rect rgb(230, 245, 255)
        note right of User: 정보 검색 플로우
        User->>Web: 검색 페이지 접근
        User->>Web: 검색어 입력 (질환 or 약)
        Web->>DB: diseases/drugs 테이블 조회
        DB-->>Web: 검색 결과 반환
        Web-->>User: 정보 카드 리스트 표시
    end

    %% AI 쉬운 설명
    rect rgb(255, 240, 245)
        note right of User: AI 설명 생성
        User->>Web: "AI 쉬운 설명" 버튼 클릭
        Web-->>User: 로딩 표시
        Web->>AI: 의학 용어 단순화 요청<br/>(원문 텍스트)
        
        AI->>AI: GPT-4 처리<br/>"어려운 의학 용어를<br/>쉬운 말로 바꿔주세요"
        
        AI-->>Web: 쉬운 설명 텍스트 반환
        Web-->>User: AI 설명 모달 표시<br/>⚠️ 참고용 안내 포함
    end

    %% 정보 저장
    rect rgb(240, 255, 240)
        note right of User: 정보 저장
        User->>Web: "저장하기" 버튼 클릭
        Web->>SaveDB: saved_items INSERT<br/>(type: disease|drug|ai_note)
        SaveDB-->>Web: 저장 완료
        Web-->>User: 토스트 알림<br/>"저장되었습니다"
    end
```

---

## 5. 복약 이력 조회 및 시각화 플로우

```mermaid
flowchart LR
    Start([복약 이력 페이지]) --> SelectView{뷰 선택}
    
    SelectView -->|차트 뷰| LoadChart[medication_logs<br/>데이터 조회]
    SelectView -->|캘린더 뷰| LoadCal[medication_logs<br/>데이터 조회]
    
    LoadChart --> CalcStats[통계 계산]
    CalcStats --> WeeklyData[주간 데이터 생성]
    WeeklyData --> RenderChart[Recharts<br/>바 차트 렌더링]
    
    RenderChart --> ShowStats[성공률 표시]
    ShowStats --> CompareWeek[지난 주 대비<br/>변화율 계산]
    
    LoadCal --> GroupByDate[날짜별 그룹화]
    GroupByDate --> RenderCal[캘린더 렌더링]
    RenderCal --> ColorCode{복약 상태}
    
    ColorCode -->|모두 복용| Green[녹색 표시]
    ColorCode -->|일부 복용| Yellow[노란색 표시]
    ColorCode -->|미복용| Red[빨간색 표시]
    
    Green --> Interactive
    Yellow --> Interactive
    Red --> Interactive[클릭 시<br/>상세 정보]
    
    Interactive --> DetailModal[해당 날짜<br/>복약 기록 모달]
    
    style LoadChart fill:#FFE4B5
    style LoadCal fill:#FFE4B5
    style RenderChart fill:#98FB98
    style RenderCal fill:#98FB98
```

---

## 6. 마이페이지 플로우

```mermaid
flowchart TB
    Start([마이페이지 접근]) --> LoadUser[사용자 정보 로드]
    
    LoadUser --> DisplaySections[섹션 표시]
    
    DisplaySections --> Section1[저장한 정보]
    DisplaySections --> Section2[복용 중인 약 관리]
    DisplaySections --> Section3[복약 이력 바로가기]
    
    Section1 --> LoadSaved[(saved_items<br/>조회)]
    LoadSaved --> ShowSaved[저장 목록<br/>표시]
    ShowSaved --> SavedAction{액션}
    SavedAction -->|삭제| DeleteSaved[(saved_items<br/>DELETE)]
    SavedAction -->|상세보기| ShowDetail[상세 정보 모달]
    
    Section2 --> LoadMeds[(medications<br/>조회)]
    LoadMeds --> ShowMeds[복용약 목록<br/>표시]
    ShowMeds --> MedAction{액션}
    MedAction -->|수정| EditMed[수정 모달]
    MedAction -->|삭제| ConfirmDelete{삭제 확인}
    MedAction -->|추가| AddNewMed[추가 모달]
    
    EditMed --> UpdateMed[(medications<br/>UPDATE)]
    ConfirmDelete -->|예| DeleteMed[(medications<br/>DELETE)]
    ConfirmDelete -->|아니오| ShowMeds
    AddNewMed --> CreateMed[(medications<br/>INSERT)]
    
    UpdateMed --> Refresh[목록 새로고침]
    DeleteMed --> Refresh
    CreateMed --> Refresh
    
    Section3 --> NavHistory[복약 이력<br/>페이지로 이동]
    
    style LoadSaved fill:#E6E6FA
    style LoadMeds fill:#E6E6FA
    style UpdateMed fill:#87CEEB
    style DeleteMed fill:#87CEEB
    style CreateMed fill:#87CEEB
```

---

## 7. 데이터베이스 ERD

```mermaid
erDiagram
    users ||--o{ medications : "has"
    users ||--o{ saved_items : "has"
    medications ||--o{ medication_logs : "tracks"
    diseases ||--o{ saved_items : "referenced_by"
    drugs ||--o{ saved_items : "referenced_by"

    users {
        uuid id PK "Supabase Auth UUID"
        timestamptz created_at "생성 시간"
    }

    medications {
        uuid id PK
        uuid user_id FK "사용자 ID"
        text name "약 이름 (NOT NULL)"
        text dosage "용량 (예: 500mg)"
        int times_per_day "1일 복용 횟수"
        timestamptz created_at "등록 시간"
    }

    medication_logs {
        uuid id PK
        uuid medication_id FK "약 ID"
        date taken_date "복용 날짜"
        boolean taken "복용 여부 (true/false)"
        timestamptz created_at "기록 시간"
    }

    diseases {
        uuid id PK
        text name "질환명"
        text description "설명"
        text-array common_symptoms "주요 증상 배열"
        text emergency_hint "응급 상황 힌트"
    }

    drugs {
        uuid id PK
        text name "약 이름"
        text purpose "목적/효능"
        text precaution "주의사항"
    }

    saved_items {
        uuid id PK
        uuid user_id FK "사용자 ID"
        enum type "disease | drug | ai_note"
        uuid target_id "참조 대상 ID"
        timestamptz created_at "저장 시간"
    }
```

---

## 8. 온보딩 플로우 (신규 사용자)

```mermaid
stateDiagram-v2
    [*] --> EmailVerified : 이메일 인증 완료
    
    EmailVerified --> Step1 : 온보딩 시작
    
    Step1 : 첫 약 등록 안내
    Step1 --> Step2 : "첫 약 등록하기" or "나중에"
    
    Step2 : 정보 탐색 안내
    Step2 --> Step3 : "다음"
    
    Step3 : 복약 이력 안내
    Step3 --> Dashboard : "시작하기"
    
    Dashboard : 메인 대시보드
    Dashboard --> [*]
    
    note right of Step1
        💊 복용 중인 약 등록
        - 약 이름, 용량, 복용 시간 설정
        - 스킵 가능
    end note
    
    note right of Step2
        🔍 질환·약 정보 검색
        - AI 쉬운 설명 기능 소개
    end note
    
    note right of Step3
        📊 복약 이력 자동 기록
        - 성공률 그래프 기능 소개
    end note
```

---

## 9. AI 처리 플로우 (의학 용어 단순화)

```mermaid
flowchart TD
    Start([사용자: AI 설명 요청]) --> CheckCache{캐시 확인}
    
    CheckCache -->|있음| ReturnCache[캐시된 설명 반환]
    CheckCache -->|없음| PreparePrompt[프롬프트 준비]
    
    PreparePrompt --> BuildPrompt["시스템 프롬프트 구성<br/>역할: 의학 용어 번역가<br/>제약: 진단/처방 금지"]
    
    BuildPrompt --> AddContext[원문 의학 텍스트 추가]
    AddContext --> CallAPI[OpenAI API 호출<br/>model: gpt-4]
    
    CallAPI --> Validate{응답 검증}
    
    Validate -->|실패| Error[에러 처리]
    Validate -->|성공| AddDisclaimer[⚠️ 면책 문구 추가]
    
    Error --> Retry{재시도<br/>3회 미만?}
    Retry -->|Yes| CallAPI
    Retry -->|No| ShowError[에러 메시지 표시]
    
    AddDisclaimer --> SaveCache[응답 캐싱<br/>선택적]
    SaveCache --> Display[사용자에게 표시]
    
    ReturnCache --> Display
    Display --> End([종료])
    ShowError --> End
    
    style CallAPI fill:#FFB6C1
    style AddDisclaimer fill:#FFA500
    style Validate fill:#FFD700
```

---

## 10. RLS (Row Level Security) 정책 플로우

```mermaid
flowchart LR
    Request([클라이언트 요청]) --> Auth{인증 확인}
    
    Auth -->|미인증| Reject[❌ 접근 거부]
    Auth -->|인증됨| CheckRLS[RLS 정책 확인]
    
    CheckRLS --> Medications{medications<br/>테이블?}
    CheckRLS --> Logs{medication_logs<br/>테이블?}
    CheckRLS --> Saved{saved_items<br/>테이블?}
    CheckRLS --> Static{diseases/drugs<br/>테이블?}
    
    Medications --> PolicyMed["SELECT: user_id = auth.uid()<br/>INSERT: user_id = auth.uid()<br/>UPDATE: user_id = auth.uid()<br/>DELETE: user_id = auth.uid()"]
    
    Logs --> PolicyLog["SELECT: medication.user_id = auth.uid()<br/>INSERT: medication.user_id = auth.uid()<br/>UPDATE: medication.user_id = auth.uid()<br/>DELETE: medication.user_id = auth.uid()"]
    
    Saved --> PolicySaved["SELECT: user_id = auth.uid()<br/>INSERT: user_id = auth.uid()<br/>DELETE: user_id = auth.uid()"]
    
    Static --> PolicyStatic["SELECT: 모든 사용자 허용<br/>INSERT/UPDATE/DELETE: 관리자만"]
    
    PolicyMed --> Validate{정책<br/>통과?}
    PolicyLog --> Validate
    PolicySaved --> Validate
    PolicyStatic --> Validate
    
    Validate -->|No| Reject
    Validate -->|Yes| Allow[✅ 접근 허용]
    
    Allow --> Execute[(쿼리 실행)]
    Execute --> Return[결과 반환]
    
    style Auth fill:#FFE4B5
    style Validate fill:#FFE4B5
    style Reject fill:#FFB6C1
    style Allow fill:#90EE90
```

---

## 11. 에러 핸들링 플로우

```mermaid
stateDiagram-v2
    [*] --> Operation : 작업 시작
    
    Operation --> Success : 성공
    Operation --> Error : 실패
    
    Error --> NetworkError : 네트워크 에러?
    Error --> ValidationError : 유효성 검사 실패?
    Error --> AuthError : 인증 에러?
    Error --> DatabaseError : DB 에러?
    Error --> AIError : AI API 에러?
    
    NetworkError --> ShowNetworkMsg : "인터넷 연결 확인"<br/>재시도 버튼
    ValidationError --> ShowValidationMsg : 필드별 에러 메시지
    AuthError --> RedirectLogin : 로그인 페이지로<br/>리다이렉트
    DatabaseError --> ShowDBMsg : "일시적 오류"<br/>재시도 버튼
    AIError --> ShowAIMsg : "AI 설명 생성 실패"<br/>원문만 표시
    
    ShowNetworkMsg --> Retry : 재시도
    ShowDBMsg --> Retry : 재시도
    ShowAIMsg --> [*] : 계속 진행
    
    ShowValidationMsg --> Operation : 수정 후 재시도
    RedirectLogin --> [*]
    
    Retry --> Operation
    Success --> ShowToast : 성공 토스트
    ShowToast --> [*]
    
    note right of ValidationError
        - 이메일 형식 오류
        - 비밀번호 길이 부족
        - 필수 필드 누락
    end note
    
    note right of AuthError
        - 토큰 만료
        - 권한 부족
        - 세션 무효
    end note
```

---

## 12. 상태 관리 플로우

```mermaid
flowchart TB
    subgraph Client["클라이언트 상태"]
        UI[UI Components]
        LocalState[React State<br/>useState/useReducer]
        Cache[SWR/React Query<br/>서버 상태 캐싱]
    end
    
    subgraph Server["서버 상태 (Supabase)"]
        Auth[인증 상태]
        DBData[(데이터베이스)]
    end
    
    UI --> LocalState
    LocalState --> UI
    
    UI --> Cache
    Cache --> ServerAction[Server Actions]
    
    ServerAction --> Auth
    ServerAction --> DBData
    
    DBData --> Cache
    Cache --> UI
    
    Auth -.->|세션 변경| UI
    
    style LocalState fill:#E1F5FE
    style Cache fill:#FFF9C4
    style Auth fill:#F3E5F5
    style DBData fill:#E8F5E9
    
    note1[폼 입력, 모달 상태<br/>일시적 UI 상태] -.-> LocalState
    note2[medications, logs<br/>saved_items 등<br/>서버 데이터 캐싱] -.-> Cache
```

---

## 13. 배포 및 CI/CD 플로우

```mermaid
flowchart LR
    Dev([개발자]) --> Git[Git Push]
    
    Git --> GitHub[GitHub Repository]
    
    GitHub --> Vercel{Vercel<br/>자동 배포}
    
    Vercel --> Build[빌드 프로세스]
    
    Build --> Lint[ESLint 검사]
    Build --> Type[TypeScript 검사]
    Build --> Test[테스트 실행]
    
    Lint --> Check{검사 통과?}
    Type --> Check
    Test --> Check
    
    Check -->|실패| Notify[개발자에게<br/>알림 발송]
    Check -->|성공| Deploy[프로덕션 배포]
    
    Notify --> Dev
    
    Deploy --> Preview[프리뷰 URL 생성]
    Deploy --> Prod[프로덕션 URL 업데이트]
    
    Prod --> Monitor[모니터링<br/>Vercel Analytics]
    
    Monitor --> Metrics[성능 메트릭<br/>에러 로그 수집]
    
    style Build fill:#E3F2FD
    style Check fill:#FFF9C4
    style Deploy fill:#E8F5E9
    style Monitor fill:#F3E5F5
```

---

## 14. Success Metrics 달성 플로우

```mermaid
flowchart TD
    Start([Phase 1 배포]) --> M1{회원가입/<br/>로그인 가능?}
    
    M1 -->|Yes| M2{약 등록 →<br/>복약 체크 가능?}
    M1 -->|No| Fix1[Auth 수정]
    Fix1 --> M1
    
    M2 -->|Yes| M3{복약 이력<br/>자동 저장?}
    M2 -->|No| Fix2[CRUD 수정]
    Fix2 --> M2
    
    M3 -->|Yes| M4{질환/약 검색<br/>+ AI 설명 작동?}
    M3 -->|No| Fix3[Logs 로직 수정]
    Fix3 --> M3
    
    M4 -->|Yes| M5{마이페이지<br/>저장/조회 가능?}
    M4 -->|No| Fix4[AI API 수정]
    Fix4 --> M4
    
    M5 -->|Yes| M6{RLS로<br/>타 사용자<br/>접근 차단?}
    M5 -->|No| Fix5[UI 수정]
    Fix5 --> M5
    
    M6 -->|Yes| Success[🎉 배포 성공]
    M6 -->|No| Fix6[RLS 정책 수정]
    Fix6 --> M6
    
    Success --> Monitor[모니터링 시작]
    Monitor --> Phase2[Phase 2 계획]
    
    style M1 fill:#FFE4B5
    style M2 fill:#FFE4B5
    style M3 fill:#FFE4B5
    style M4 fill:#FFE4B5
    style M5 fill:#FFE4B5
    style M6 fill:#FFE4B5
    style Success fill:#90EE90
```

---

## 15. Phase 1 vs Phase 2 구분

```mermaid
graph TB
    subgraph Phase1["🟢 Phase 1 - 즉시 구현"]
        P1_1[질환·약 정보 탐색]
        P1_2[AI 쉬운 설명]
        P1_3[정보 저장 기능]
        P1_4[복용약 등록/관리]
        P1_5[오늘 복약 체크]
        P1_6[복약 이력 기록]
        P1_7[주간 성공률 차트]
        P1_8[캘린더 뷰]
    end
    
    subgraph Phase2["🟡 Phase 2 - DB만 설계"]
        P2_1[복약 알림 Push]
        P2_2[시간대별 알림]
        P2_3[복약 패턴 분석]
        P2_4[장기 통계]
        P2_5[예측 분석]
    end
    
    subgraph Out["🔴 Out - 완전 제외"]
        O1[증상 입력/분석]
        O2[진단/처방 추천]
        O3[생활습관 관리]
        O4[병원 예약]
        O5[웨어러블 연동]
    end
    
    P1_1 --> MVP[MVP 배포]
    P1_2 --> MVP
    P1_3 --> MVP
    P1_4 --> MVP
    P1_5 --> MVP
    P1_6 --> MVP
    P1_7 --> MVP
    P1_8 --> MVP
    
    MVP -.-> Future[향후 개발]
    Future -.-> P2_1
    Future -.-> P2_2
    Future -.-> P2_3
    Future -.-> P2_4
    Future -.-> P2_5
    
    style Phase1 fill:#E8F5E9
    style Phase2 fill:#FFF9C4
    style Out fill:#FFEBEE
    style MVP fill:#C8E6C9
```

---

## 16. 기술 스택 의존성 다이어그램

```mermaid
graph TD
    subgraph Frontend["프론트엔드"]
        Next[Next.js 14<br/>App Router]
        React[React 18]
        TS[TypeScript]
        Tailwind[Tailwind CSS]
    end
    
    subgraph UI["UI 라이브러리"]
        Shadcn[shadcn/ui]
        Recharts[Recharts]
        Icons[Lucide Icons]
    end
    
    subgraph Backend["백엔드"]
        Actions[Server Actions]
        API[API Routes]
    end
    
    subgraph Data["데이터 레이어"]
        Supabase[Supabase]
        Auth[Auth Service]
        PG[(PostgreSQL)]
        RLS[RLS]
    end
    
    subgraph External["외부 서비스"]
        OpenAI[OpenAI API]
        Vercel[Vercel Deploy]
    end
    
    Next --> React
    Next --> TS
    Next --> Tailwind
    Next --> Actions
    Next --> API
    
    React --> Shadcn
    React --> Recharts
    React --> Icons
    
    Actions --> Supabase
    API --> Supabase
    
    Supabase --> Auth
    Supabase --> PG
    Supabase --> RLS
    
    Actions --> OpenAI
    
    Next --> Vercel
    
    style Frontend fill:#E3F2FD
    style UI fill:#F3E5F5
    style Backend fill:#FFF3E0
    style Data fill:#E8F5E9
    style External fill:#FCE4EC
```

---

## 17. 실시간 업데이트 플로우 (선택적)

```mermaid
sequenceDiagram
    participant User1 as 사용자 A
    participant Client1 as Client A
    participant Supabase as Supabase Realtime
    participant DB as PostgreSQL
    participant Client2 as Client B
    participant User2 as 사용자 B

    note over User1,User2: 동일 사용자가 다른 기기에서 접속한 경우

    User1->>Client1: 복약 체크
    Client1->>DB: medication_logs UPDATE
    DB-->>Supabase: 변경 감지 (Trigger)
    
    Supabase->>Client2: 실시간 이벤트 전송
    Client2->>Client2: 로컬 상태 업데이트
    Client2-->>User2: UI 자동 갱신
    
    note over Client2,User2: 새로고침 없이<br/>복약 상태 동기화
```

---

## 주요 의사결정 기록

### ✅ 채택한 것
1. **Next.js App Router**: 최신 패턴, Server Actions 활용
2. **Supabase**: All-in-one (Auth + DB + RLS)
3. **OpenAI API**: 의학 용어 단순화 전용
4. **Recharts**: 간단한 차트 라이브러리
5. **Tailwind CSS**: 빠른 개발, 일관된 디자인

### ❌ 제외한 것
1. **Redux/Zustand**: 과도한 상태관리 (Server Actions로 충분)
2. **tRPC**: 타입 안정성은 좋으나 학습곡선 고려
3. **Prisma**: Supabase SDK로 충분
4. **PWA**: Phase 1에서는 불필요
5. **WebSocket**: Realtime은 Phase 2로 연기

### 🎯 핵심 원칙
- **KISS (Keep It Simple, Stupid)**
- **YAGNI (You Aren't Gonna Need It)**
- **Phase 1 = MVP (Minimum Viable Product)**

---

## 다음 단계

1. ✅ ERD 최종 확정
2. ✅ Supabase 프로젝트 생성
3. ✅ Next.js 프로젝트 초기화
4. ⏳ 인증 플로우 구현
5. ⏳ 메인 대시보드 구현
6. ⏳ AI 통합
7. ⏳ 배포 및 테스트

---

**작성일**: 2026-02-04  
**버전**: 1.0  
**작성자**: My-Medi 개발팀
