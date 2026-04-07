# Phase 1 Setup Guide

### IntentList — Local-First MVP

**Version:** 1.0
**Date:** March 17, 2026

---

## Overview

Phase 1 establishes the production-ready foundation for IntentList with local-first architecture. This phase includes:

- React Native (Expo SDK 52+) with TypeScript
- Local SQLite database with Drizzle ORM
- Zustand for client-side state management
- Mood-state based task surfacing
- Active task cap enforcement (15 tasks)
- Basic task CRUD operations

---

## Prerequisites

- Node.js 18+
- npm or bun
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

For Phase 1, no environment variables are required. The app runs fully offline.

### 3. Start Development Server

```bash
npm start
```

Then press:

- `i` — Open iOS simulator
- `a` — Open Android emulator
- `w` — Open web browser

---

## Project Structure

```
intentlist/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── _layout.tsx    # Tab bar configuration
│   │   ├── index.tsx      # Home/Tasks screen
│   │   └── explore.tsx    # Someday list screen
│   ├── _layout.tsx        # Root layout with initialization
│   └── modal.tsx          # Settings screen
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── config/               # App configuration
│   └── index.ts          # Environment and feature flags
├── constants/            # App-wide constants
│   ├── index.ts          # Core constants (limits, weights)
│   └── theme.ts          # Theme colors and fonts
├── db/                   # Database layer
│   ├── schema/           # Drizzle ORM schema
│   │   └── index.ts      # Table definitions
│   └── index.ts          # Database initialization
├── docs/                 # Documentation
│   ├── IntentList-PRD    # Product Requirements
│   ├── IntentList-TRD    # Technical Requirements
│   └── requirements-matrix.md  # Requirements traceability
├── hooks/                # React hooks
├── services/             # Business logic
│   ├── friction/         # Friction score service
│   ├── mood/             # Mood matching service
│   └── task/             # Task CRUD service
├── stores/               # Zustand stores
│   ├── index.ts          # Store exports
│   ├── mood-store.ts     # Mood state management
│   ├── settings-store.ts # User preferences
│   └── task-store.ts     # Task state management
├── types/                # TypeScript types
│   └── index.ts          # Type definitions
├── .env.example          # Environment template
├── .prettierrc           # Prettier configuration
├── eslint.config.js      # ESLint configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

---

## Available Scripts

| Command                | Description                   |
| ---------------------- | ----------------------------- |
| `npm start`            | Start Expo development server |
| `npm run android`      | Open Android emulator         |
| `npm run ios`          | Open iOS simulator            |
| `npm run web`          | Open web browser              |
| `npm run lint`         | Run ESLint                    |
| `npm run lint:fix`     | Run ESLint with auto-fix      |
| `npm run format`       | Format code with Prettier     |
| `npm run format:check` | Check code formatting         |
| `npm run typecheck`    | Run TypeScript type checking  |
| `npm run db:generate`  | Generate Drizzle migrations   |
| `npm run db:migrate`   | Run database migrations       |

---

## Architecture Overview

### Local-First Design

All data is stored locally in SQLite. The server (Supabase) is only used in Phase 2+ for:

- Cross-device sync
- Team collaboration features
- Analytics (anonymized)

### State Management

- **Zustand stores** — Client-side UI state and cached data
- **SQLite database** — Persistent data storage
- **AsyncStorage** — Simple preferences and session data

### Data Flow

```
User Action → Zustand Store → Service Layer → SQLite
                ↓
           UI Update (optimistic)
```

---

## Key Features (Phase 1)

### Mood-State Selection

- 5 mood states: Focused, Low Energy, Between Things, Creative, Quick Clear
- Persists across sessions
- Refreshes after 4+ hours of inactivity

### Task Management

- Create, read, update, delete tasks
- Optional: mood tag, duration estimate, person tag
- Active task cap: 15 tasks (configurable: 10/15/20)

### Focused Task View

- Shows up to 6 mood-matched tasks
- Swipe right to complete, left to snooze (Phase 2)

### Someday List

- Deferred tasks that don't fit in active cap
- Accessible via second tab

---

## Database Schema

### Tables (Phase 1)

| Table                | Description                       |
| -------------------- | --------------------------------- |
| `users`              | Local user profile cache          |
| `tasks`              | Task records                      |
| `subtasks`           | Sub-task items (Phase 2)          |
| `mood_sessions`      | Mood session history (Phase 2)    |
| `friction_events`    | Friction tracking (Phase 2)       |
| `reckoning_sessions` | Sunday Reckoning log (Phase 2)    |
| `sync_queue`         | Pending sync operations (Phase 2) |

See `db/schema/index.ts` for full schema definitions.

---

## Configuration

### Feature Flags

Controlled via `config/index.ts`:

```typescript
features: {
  moodState: true,         // Phase 1
  taskCap: true,           // Phase 1
  frictionMapping: false,  // Phase 2
  sundayReckoning: false,  // Phase 2
  trueContextMoment: false,// Phase 3
  teamFeatures: false,     // Phase 3
}
```

### Constraints

```typescript
constraints: {
  activeTaskLimit: 15,
  moodStateOptions: 5,
  focusedTaskViewLimit: 6,
  frictionInterventionThreshold: 8,
}
```

---

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- ESLint with Expo config + custom rules
- Prettier for formatting (100 char line width)
- Path aliases: `@/`, `@db/`, `@services/`, `@stores/`, `@types/`

### Component Patterns

- Functional components with hooks
- Zustand for state management
- Separate UI and logic concerns

### Testing (Phase 2)

- Unit tests: Jest + React Native Testing Library
- E2E tests: Detox
- Target: 80% coverage

---

## Phase 2 Roadmap

1. **Friction Mapping** — Track avoidance patterns, trigger interventions
2. **Sunday Reckoning** — Weekly review conversation flow
3. **Sub-task Generation** — Break down complex tasks
4. **Sync Layer** — Cross-device sync with Supabase

---

## Troubleshooting

### Database Issues

```bash
# Reset database (development only)
rm intentlist.db
npm start
```

### Cache Issues

```bash
# Clear Expo cache
expo start -c
```

### Type Errors

```bash
# Run type check
npm run typecheck
```

---

## Next Steps

1. Run `npm start` and test the app
2. Review `docs/requirements-matrix.md` for full requirements
3. Begin implementing Phase 2 features after Phase 1 validation

---

_This is a living document. Update as the codebase evolves._
