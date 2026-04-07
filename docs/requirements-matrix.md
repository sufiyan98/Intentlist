# Requirements Matrix

### IntentList — Context-Aware Task Completion Engine

**Version:** 1.0
**Date:** March 17, 2026
**Source Documents:** IntentList-PRD v1.0, IntentList-TRD v1.0

---

## 1. Functional Requirements

| ID     | Category            | Requirement                                                                                                                                  | Priority    | Phase | Source           |
| ------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----- | ---------------- |
| FR-001 | Mood-State System   | App must present a mood-state selection screen on every cold open and after 4+ hours of inactivity                                           | Must Have   | 1     | PRD 6.1          |
| FR-002 | Mood-State System   | Mood selection must offer exactly 5 states: Focused, Low Energy, Between Things, Creative, Quick Clear                                       | Must Have   | 1     | PRD 6.1          |
| FR-003 | Mood-State System   | Task list must update immediately upon mood selection with no perceptible lag                                                                | Must Have   | 1     | PRD 6.1          |
| FR-004 | Mood-State System   | Selected mood must persist for the session unless manually changed                                                                           | Must Have   | 1     | PRD 6.1          |
| FR-005 | Mood-State System   | "Show everything" toggle must be available but require deliberate action                                                                     | Must Have   | 1     | PRD 6.1          |
| FR-006 | Task Input          | Task can be added in under 5 seconds with zero required fields beyond the name                                                               | Must Have   | 1     | PRD 6.2          |
| FR-007 | Task Input          | System must enforce active task cap of 15 tasks with no UI exceptions                                                                        | Must Have   | 1     | PRD 6.2          |
| FR-008 | Task Input          | Cap Resolution Flow must trigger when adding 16th task, showing 3 oldest/lowest-priority tasks                                               | Must Have   | 1     | PRD 6.2          |
| FR-009 | Task Input          | User must resolve at least one task (Done/Move/Delete) before proceeding past cap                                                            | Must Have   | 1     | PRD 6.2          |
| FR-010 | Task Input          | Natural language date parsing must work for common Indian English expressions                                                                | Should Have | 2     | PRD 6.2          |
| FR-011 | Task Input          | Person tagging must surface existing contacts from device (with permission)                                                                  | Should Have | 2     | PRD 6.2          |
| FR-012 | Focused Task View   | Focused view must never show more than 6 tasks                                                                                               | Must Have   | 1     | PRD 6.3          |
| FR-013 | Focused Task View   | Task cards must display: task name, estimated duration, context tag                                                                          | Must Have   | 1     | PRD 6.3          |
| FR-014 | Focused Task View   | Right swipe must mark task complete with satisfying animation                                                                                | Must Have   | 1     | PRD 6.3          |
| FR-015 | Focused Task View   | Left swipe must snooze task with options: Later today/Tomorrow morning/This weekend                                                          | Must Have   | 1     | PRD 6.3          |
| FR-016 | Focused Task View   | Tapping a task must open detail view with sub-tasks, notes, and history                                                                      | Must Have   | 1     | PRD 6.3          |
| FR-017 | Focused Task View   | View must reload without full screen refresh when task is completed                                                                          | Must Have   | 1     | PRD 6.3          |
| FR-018 | Friction Mapping    | Friction score must be calculated on-device using: scroll-past (+1), snoozes (+2), due date moves (+3), session no-interact (+1)             | Should Have | 2     | PRD 6.4, TRD 6.2 |
| FR-019 | Friction Mapping    | Intervention must trigger when friction score ≥ 8                                                                                            | Should Have | 2     | PRD 6.4, TRD 6.2 |
| FR-020 | Friction Mapping    | Intervention must appear at most once per session, at session start (never mid-session or as push)                                           | Should Have | 2     | PRD 6.4          |
| FR-021 | Friction Mapping    | Intervention options must include: unclear first step, too big, waiting on someone, don't want to do it, already done                        | Should Have | 2     | PRD 6.4          |
| FR-022 | Friction Mapping    | Sub-task generation must produce 2–4 actionable steps based on task category templates                                                       | Should Have | 2     | PRD 6.4          |
| FR-023 | Friction Mapping    | Person-linked follow-up must create a new task referencing the original                                                                      | Should Have | 2     | PRD 6.4          |
| FR-024 | Sunday Reckoning    | Reckoning notification must trigger at 7:00 PM local time every Sunday                                                                       | Should Have | 2     | PRD 6.5          |
| FR-025 | Sunday Reckoning    | User must be able to reschedule trigger to Saturday evening or Sunday morning                                                                | Should Have | 2     | PRD 6.5          |
| FR-026 | Sunday Reckoning    | Reckoning must only surface tasks moved 2+ times or untouched for 7 days                                                                     | Should Have | 2     | PRD 6.5, TRD 6.4 |
| FR-027 | Sunday Reckoning    | Conversation must complete in under 4 minutes for typical user (5–8 flagged tasks)                                                           | Should Have | 2     | PRD 6.5          |
| FR-028 | Sunday Reckoning    | All decisions must take immediate effect with no "save changes" step                                                                         | Should Have | 2     | PRD 6.5          |
| FR-029 | Sunday Reckoning    | Skipping Reckoning must be allowed with no guilt-tripping language                                                                           | Should Have | 2     | PRD 6.5          |
| FR-030 | Sunday Reckoning    | Reckoning state must be saved if interrupted, allowing resume                                                                                | Should Have | 2     | PRD 6.5          |
| FR-031 | True Context Moment | Location-linked task notification must fire only when: within radius, calendar free for duration+10min, time 8AM–8PM, not snoozed in 4 hours | Could Have  | 3     | PRD 6.6, TRD 8.1 |
| FR-032 | True Context Moment | Laptop opened after 9 PM must hide tasks requiring 60+ minutes, surface only ≤30-minute tasks                                                | Could Have  | 3     | PRD 6.6          |
| FR-033 | True Context Moment | User must be able to set "quiet hours" that override all context notifications                                                               | Could Have  | 3     | PRD 6.6          |
| FR-034 | True Context Moment | Maximum 10 active geofences at any time, default radius 200m, configurable 100–500m                                                          | Could Have  | 3     | TRD 8.2          |
| FR-035 | Team Features       | Tasks can be assigned between team members within a shared workspace                                                                         | Could Have  | 3     | PRD 7.1          |
| FR-036 | Team Features       | Blocker Intelligence must surface weekly insight when 2+ members flag same task as blocked                                                   | Could Have  | 3     | PRD 7.2          |
| FR-037 | Team Features       | Team Reckoning must provide Monday morning summary: completion rate, top 3 unresolved, shared blockers                                       | Could Have  | 3     | PRD 7.3          |
| FR-038 | Team Features       | Manager must never be able to see individual mood states                                                                                     | Could Have  | 3     | PRD 7.3          |
| FR-039 | Basic CRUD          | System must support full task CRUD operations (Create, Read, Update, Delete)                                                                 | Must Have   | 1     | PRD 5.1          |
| FR-040 | Backlog             | System must support Backlog/Someday list for deferred tasks                                                                                  | Must Have   | 1     | PRD 5.1          |
| FR-041 | Auth                | System must support email/password and Google OAuth authentication                                                                           | Must Have   | 1     | TRD 3.2, 5.2     |
| FR-042 | Sync                | System must support cross-device sync via push/pull operations                                                                               | Must Have   | 1     | TRD 2.1, 9.1     |
| FR-043 | Sync                | System must operate in offline mode with background sync when online                                                                         | Must Have   | 1     | TRD 2.1, 9.1     |
| FR-044 | Analytics           | System must fire anonymized usage events (task_completed, reckoning_completed, etc.)                                                         | Must Have   | 1     | TRD 5.5          |
| FR-045 | Data Export         | Users must be able to export all their data as JSON at any time                                                                              | Must Have   | 1     | PRD 8.4          |

---

## 2. Non-Functional Requirements

| ID      | Category        | Requirement                                                 | Target/Metric                         | Source       |
| ------- | --------------- | ----------------------------------------------------------- | ------------------------------------- | ------------ |
| NFR-001 | Performance     | App cold start time                                         | < 2 seconds (Redmi Note 12 baseline)  | TRD 12       |
| NFR-002 | Performance     | Mood selection to task list display latency                 | < 300ms                               | TRD 12       |
| NFR-003 | Performance     | Task completion animation frame rate                        | 60 fps                                | TRD 12       |
| NFR-004 | Performance     | Task add operation (no cap check)                           | < 100ms                               | TRD 12       |
| NFR-005 | Performance     | Friction score calculation                                  | < 50ms                                | TRD 12       |
| NFR-006 | Performance     | ML inference time                                           | < 100ms                               | TRD 12       |
| NFR-007 | Performance     | SQLite performance with 500 tasks                           | Must maintain all performance targets | TRD 14.4     |
| NFR-008 | Reliability     | Background sync retry with exponential backoff              | 3 attempts: 1s, 5s, 30s               | TRD 13.2     |
| NFR-009 | Reliability     | Graceful degradation when calendar/location unavailable     | Features hide with explanation        | TRD 13.1     |
| NFR-010 | Reliability     | Full offline mode when server unreachable                   | 100% core functionality               | TRD 13.1     |
| NFR-011 | Usability       | Mood selection UI completion time                           | < 3 seconds                           | PRD 6.1      |
| NFR-012 | Usability       | Mood selection options                                      | Exactly 5, never more                 | PRD 6.1      |
| NFR-013 | Usability       | Accessible full screen tap targets for mood selection       | WCAG compliant                        | PRD 6.1      |
| NFR-014 | Usability       | Friendly, non-corporate language                            | No "Priority Matrix" framing          | PRD 6.1      |
| NFR-015 | Usability       | Onboarding flow                                             | 3 screens maximum                     | PRD 11       |
| NFR-016 | Maintainability | Unit test coverage                                          | ≥ 80%                                 | TRD 14.1     |
| NFR-017 | Scalability     | Support 200 beta users (Phase 1), scale to public (Phase 2) | Horizontal scaling via Supabase       | PRD 9.1, 9.2 |
| NFR-018 | Availability    | Account deletion data removal                               | Within 24 hours with confirmation     | PRD 8.4      |

---

## 3. Architecture Constraints

| ID     | Constraint               | Description                                                                    | Source       |
| ------ | ------------------------ | ------------------------------------------------------------------------------ | ------------ |
| AC-001 | Local-First Architecture | All reads and writes hit SQLite first; server sync is background, non-blocking | TRD 2.1, 2.2 |
| AC-002 | Offline Capability       | Core task management must work 100% without network                            | TRD 2.2      |
| AC-003 | Optimistic UI            | All user actions reflect immediately in UI; sync happens asynchronously        | TRD 2.2      |
| AC-004 | Conflict Resolution      | Last-write-wins with full conflict log for debugging                           | TRD 2.2      |
| AC-005 | Frontend Framework       | React Native with Expo SDK 52+                                                 | TRD 3.1      |
| AC-006 | Navigation               | Expo Router file-based routing v4                                              | TRD 3.1      |
| AC-007 | State Management         | Zustand v5                                                                     | TRD 3.1      |
| AC-008 | Local Database           | op-sqlite with Drizzle ORM                                                     | TRD 3.1      |
| AC-009 | Animations               | React Native Reanimated v3 for 60fps UI thread animations                      | TRD 3.1      |
| AC-010 | Gestures                 | React Native Gesture Handler v2 (required for Reanimated v3)                   | TRD 3.1      |
| AC-011 | On-Device ML             | TensorFlow Lite React Native                                                   | TRD 3.1      |
| AC-012 | Backend Platform         | Supabase (managed Postgres, Auth, Realtime, Storage)                           | TRD 3.2      |
| AC-013 | Server Functions         | Supabase Edge Functions (Deno)                                                 | TRD 3.2      |
| AC-014 | Realtime Sync            | Supabase Realtime via PostgreSQL change streams                                | TRD 3.2      |
| AC-015 | HTTP Client              | TanStack Query + Axios                                                         | TRD 3.1      |
| AC-016 | CI/CD                    | GitHub Actions, EAS Build (Expo), Vercel for web hosting                       | TRD 3.3      |
| AC-017 | Monitoring               | Sentry for error monitoring, PostHog (self-hosted) for analytics               | TRD 3.3      |
| AC-018 | Secret Management        | Doppler for environment variables                                              | TRD 3.3      |
| AC-019 | ML Model Size            | Total TF Lite models under 1MB                                                 | TRD 15       |
| AC-020 | Geofencing               | expo-location with startGeofencingAsync, max 10 active geofences               | TRD 8.2      |

---

## 4. Privacy & Security Constraints

| ID      | Constraint                         | Description                                                                                                               | Source         |
| ------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------- |
| PSC-001 | On-Device Data (Never Transmitted) | Task content, mood state selections, behavioral friction scores, location data, calendar event content never leave device | PRD 8.1        |
| PSC-002 | Server-Side Data (Anonymized)      | Only: session count, feature usage frequency, completion rate metrics, crash reports                                      | PRD 8.2        |
| PSC-003 | Team Data Encryption               | Shared task names/status stored encrypted; users can export and delete anytime                                            | PRD 8.3        |
| PSC-004 | No ML Training Without Opt-In      | No team data used for product analytics or ML training without explicit opt-in                                            | PRD 8.3        |
| PSC-005 | On-Device ML                       | TensorFlow Lite runs locally; no data leaves device                                                                       | PRD 8.4, TRD 7 |
| PSC-006 | Friction Score Privacy             | Friction score calculated entirely on-device, never transmitted to servers                                                | PRD 6.4        |
| PSC-007 | Location Data Privacy              | Location data processed on-device, never stored on servers                                                                | PRD 6.6        |
| PSC-008 | Calendar Integration               | OAuth-based (Google Calendar v1); event content stays on device                                                           | PRD 6.6        |
| PSC-009 | Sync Encryption                    | AES-256-GCM encryption using derived key from password (PBKDF2, 310000 iterations, SHA-256)                               | TRD 9.2        |
| PSC-010 | JWT Security                       | JWT: 1-hour expiry; Refresh tokens: 30-day expiry, rotated on use                                                         | TRD 11.1       |
| PSC-011 | Rate Limiting                      | 5 auth failures → 15-minute lockout                                                                                       | TRD 11.1       |
| PSC-012 | Password Policy                    | Minimum 8 characters                                                                                                      | TRD 11.1       |
| PSC-013 | HTTPS Enforcement                  | All API communication over HTTPS                                                                                          | TRD 11.2       |
| PSC-014 | Input Validation                   | Zod schemas for all API inputs                                                                                            | TRD 11.2       |
| PSC-015 | SQL Injection Prevention           | Drizzle ORM for all database operations                                                                                   | TRD 11.2       |
| PSC-016 | Row-Level Security                 | Supabase RLS policies enforced                                                                                            | TRD 11.2       |
| PSC-017 | Biometric/PIN Lock                 | Optional per app open                                                                                                     | TRD 11.3       |
| PSC-018 | Auto-Lock                          | After 10 minutes in background                                                                                            | TRD 11.3       |
| PSC-019 | Data Export                        | Users can export all data as JSON at any time                                                                             | PRD 8.4        |
| PSC-020 | Account Deletion                   | Removes all server-side data within 24 hours with confirmation                                                            | PRD 8.4        |
| PSC-021 | Mood State Privacy (Team)          | Manager can never see individual mood states                                                                              | PRD 7.3        |
| PSC-022 | Friction Intervention Delivery     | Friction interventions are NEVER delivered as push notifications (in-app only)                                            | TRD 10         |

---

## 5. Acceptance Criteria

### 5.1 Mood-State Entry Screen

| ID          | Criterion                                                                      | Source  |
| ----------- | ------------------------------------------------------------------------------ | ------- |
| AC-MOOD-001 | Mood-state screen appears on every cold open and after 4+ hours of inactivity  | PRD 6.1 |
| AC-MOOD-002 | Task list updates immediately upon mood selection with no perceptible lag      | PRD 6.1 |
| AC-MOOD-003 | "Show everything" is available but requires deliberate action                  | PRD 6.1 |
| AC-MOOD-004 | Selected mood is stored locally and used for pattern analysis (on-device only) | PRD 6.1 |

### 5.2 Task Input System

| ID           | Criterion                                                                                                           | Source  |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | ------- |
| AC-INPUT-001 | Task can be added in under 5 seconds with zero required fields beyond the name                                      | PRD 6.2 |
| AC-INPUT-002 | Cap enforcement triggers at exactly 15 active tasks, no exceptions in UI                                            | PRD 6.2 |
| AC-INPUT-003 | Natural language date parsing works for common Indian English expressions ("next Monday", "by EOD", "this weekend") | PRD 6.2 |
| AC-INPUT-004 | Person tagging surfaces existing contacts from device (with permission)                                             | PRD 6.2 |

### 5.3 Focused Task View

| ID           | Criterion                                                                                                   | Source  |
| ------------ | ----------------------------------------------------------------------------------------------------------- | ------- |
| AC-FOCUS-001 | Focused view never shows more than 6 tasks                                                                  | PRD 6.3 |
| AC-FOCUS-002 | Completing a task triggers a micro-animation that feels rewarding (not just a checkmark disappearing)       | PRD 6.3 |
| AC-FOCUS-003 | Snooze options are time-contextual (e.g., "this weekend" doesn't appear on Monday at 9 AM if busy schedule) | PRD 6.3 |
| AC-FOCUS-004 | View reloads without full screen refresh when a task is completed                                           | PRD 6.3 |

### 5.4 Friction Mapping System

| ID           | Criterion                                                                                                  | Source  |
| ------------ | ---------------------------------------------------------------------------------------------------------- | ------- |
| AC-FRICT-001 | Friction score is calculated entirely on-device, never transmitted to servers                              | PRD 6.4 |
| AC-FRICT-002 | Intervention appears at most once per session                                                              | PRD 6.4 |
| AC-FRICT-003 | Sub-task generation for "too big / unclear" produces 2–4 actionable steps based on task category templates | PRD 6.4 |
| AC-FRICT-004 | Person-linked follow-up creates a new task that references the original                                    | PRD 6.4 |
| AC-FRICT-005 | "Delete it" option on avoidant tasks has a one-step confirmation, not two                                  | PRD 6.4 |

### 5.5 Sunday Reckoning

| ID          | Criterion                                                                                           | Source  |
| ----------- | --------------------------------------------------------------------------------------------------- | ------- |
| AC-RECK-001 | Reckoning only surfaces tasks that meet flagging criteria (moved 2+ times, or untouched for 7 days) | PRD 6.5 |
| AC-RECK-002 | Conversation completes in under 4 minutes for a typical user (tested with 5–8 flagged tasks)        | PRD 6.5 |
| AC-RECK-003 | All decisions made in the Reckoning take immediate effect — no "save changes" step                  | PRD 6.5 |
| AC-RECK-004 | Skipping the Reckoning entirely is allowed — no guilt-tripping language if user dismisses           | PRD 6.5 |
| AC-RECK-005 | Reckoning state is saved if interrupted — user can resume where they left off                       | PRD 6.5 |

### 5.6 True Context Moment

| ID             | Criterion                                                                                                                        | Source  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------- |
| AC-CONTEXT-001 | Location data is processed on-device, never stored on servers                                                                    | PRD 6.6 |
| AC-CONTEXT-002 | Calendar integration is OAuth-based (Google Calendar v1, Outlook Phase 3b)                                                       | PRD 6.6 |
| AC-CONTEXT-003 | All three conditions (location, calendar free block, time 8AM–8PM) must be simultaneously true for location notification to fire | PRD 6.6 |
| AC-CONTEXT-004 | User can set "quiet hours" that override all context notifications                                                               | PRD 6.6 |
| AC-CONTEXT-005 | Notification includes task name, estimated time needed, and one-tap "Not now — remind me next time I'm nearby"                   | PRD 6.6 |

### 5.7 Testing Requirements

| ID          | Criterion                                                             | Source   |
| ----------- | --------------------------------------------------------------------- | -------- |
| AC-TEST-001 | MoodMatchingService: all mood/task combinations tested                | TRD 14.1 |
| AC-TEST-002 | FrictionScoreService: scoring, threshold, reset tested                | TRD 14.1 |
| AC-TEST-003 | TaskCapService: enforcement, resolution, edges tested                 | TRD 14.1 |
| AC-TEST-004 | ReckoningService: flagging, outcomes tested                           | TRD 14.1 |
| AC-TEST-005 | SyncEncryptionService: encrypt/decrypt roundtrip tested               | TRD 14.1 |
| AC-TEST-006 | Full task lifecycle E2E: create → friction → intervention → complete  | TRD 14.2 |
| AC-TEST-007 | Cap enforcement E2E: 14 tasks → 15th attempt → resolution → success   | TRD 14.2 |
| AC-TEST-008 | Sync roundtrip E2E: local write → push → pull → decrypt               | TRD 14.2 |
| AC-TEST-009 | Sunday Reckoning E2E: full conversation flow                          | TRD 14.2 |
| AC-TEST-010 | Onboarding, mood→list, swipe complete, team task assignment E2E tests | TRD 14.3 |

---

## 6. Success Metrics (from PRD)

| Metric                                  | Phase 1 Target                      | Phase 2 Target     | Phase 3 Target | Industry Baseline |
| --------------------------------------- | ----------------------------------- | ------------------ | -------------- | ----------------- |
| 7-day task completion rate (North Star) | ≥ 60%                               | ≥ 68%              | ≥ 75%          | ~41%              |
| D7 retention                            | ≥ 55%                               | —                  | —              | ~30%              |
| D30 retention                           | ≥ 35%                               | —                  | —              | —                 |
| DAU/MAU ratio                           | ≥ 0.45                              | —                  | —              | —                 |
| Free to paid conversion                 | —                                   | 8% (month 6)       | —              | —                 |
| MRR growth                              | 20% month-over-month through Year 1 | —                  | —              | —                 |
| Net Promoter Score                      | —                                   | ≥ 50 (end Phase 2) | —              | —                 |

### Anti-Metrics (Explicitly NOT Optimized For)

- Total tasks added
- Time spent in app
- Notification volume

---

## 7. Traceability Matrix

| Feature             | PRD Section | TRD Sections   | Requirements       | Acceptance Criteria              |
| ------------------- | ----------- | -------------- | ------------------ | -------------------------------- |
| Mood-State Entry    | 6.1         | 6.1, 12        | FR-001 to FR-005   | AC-MOOD-001 to AC-MOOD-004       |
| Task Input System   | 6.2         | 6.3, 12        | FR-006 to FR-011   | AC-INPUT-001 to AC-INPUT-004     |
| Focused Task View   | 6.3         | 6.1, 12        | FR-012 to FR-017   | AC-FOCUS-001 to AC-FOCUS-004     |
| Friction Mapping    | 6.4         | 6.2, 7.1, 10   | FR-018 to FR-023   | AC-FRICT-001 to AC-FRICT-005     |
| Sunday Reckoning    | 6.5         | 6.4, 10        | FR-024 to FR-030   | AC-RECK-001 to AC-RECK-005       |
| True Context Moment | 6.6         | 8.1, 8.2, 10   | FR-031 to FR-034   | AC-CONTEXT-001 to AC-CONTEXT-005 |
| Team Features       | 7.1–7.3     | 4.2, 5.4       | FR-035 to FR-038   | —                                |
| Privacy & Security  | 8.1–8.4     | 9.2, 11.1–11.3 | PSC-001 to PSC-022 | —                                |
| Testing             | —           | 14.1–14.4      | —                  | AC-TEST-001 to AC-TEST-010       |

---

_This matrix is a living document. Update as requirements evolve through user feedback and engineering review._
