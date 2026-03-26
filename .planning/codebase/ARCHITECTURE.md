# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** Client-heavy Next.js monolith backed by Supabase BaaS

**Key Characteristics:**
- App Router pages are thin shells around client components
- Most reads and writes happen directly from client components to Supabase
- Minimal server code: one operational API route for keepalive
- Product logic is split between UI components, hooks, and small utility modules

## Layers

**Routing layer:**
- Purpose: Entry points and navigation
- Contains: `app/page.tsx`, `app/dashboard/page.tsx`, `app/[user]/page.tsx`, `app/api/keepalive/*`
- Depends on: components, Supabase client, Next navigation
- Used by: browser requests and cron invocations

**Feature UI layer:**
- Purpose: Render setup, dashboard, drink selection, stats, modals
- Contains: `components/SetupScreen.tsx`, `components/DashboardClient.tsx`, `components/DrinkPicker/*`, modal/sheet components
- Depends on: hooks, `lib/*`, UI primitives
- Used by: route components

**Hook/state layer:**
- Purpose: Encapsulate feature-specific client data access
- Contains: `lib/session.ts`, `components/DrinkPicker/hooks/*`
- Depends on: Supabase client
- Used by: feature UI layer

**Service/utility layer:**
- Purpose: Centralize pure logic and some auth/data helpers
- Contains: `lib/profileService.ts`, `lib/calculations.ts`, `lib/exportService.ts`, `lib/resetApp.ts`, `lib/pinUtils.ts`
- Depends on: Supabase client and shared constants
- Used by: components and hooks

**External platform layer:**
- Purpose: Identity, database, scheduled keepalive
- Contains: Supabase project, GitHub Actions, Vercel cron
- Depends on: environment variables and deployed app URL
- Used by: all data-bearing flows

## Data Flow

**Signup/Login flow:**
1. `app/page.tsx` checks current Supabase session
2. If no valid session/profile exists, it renders `components/SetupScreen.tsx`
3. `lib/profileService.ts` converts username to synthetic email and signs in/up via Supabase Auth
4. On success, a `profiles` row is read or created, then user is redirected to `/dashboard`

**Dashboard load flow:**
1. `app/dashboard/page.tsx` loads the current session and user profile
2. `components/DashboardClient.tsx` fetches `consumption` joined with `drinks(name)`
3. Aggregates are computed client-side and rendered into cards, lists and modals

**Drink add flow:**
1. User opens `components/DrinkPicker/DrinkPicker.tsx` or `components/DrinkForm.tsx`
2. UI reads available drinks from Supabase
3. Insert happens through `lib/consumptionService.ts`
4. UI refreshes dashboard state by re-running fetches

**Keepalive flow:**
1. Vercel cron or GitHub Actions hits `/api/keepalive`
2. `app/api/keepalive/route.ts` authenticates with bearer secret
3. Server-side Supabase client inserts then deletes a synthetic `consumption` row

**State Management:**
- Local React state dominates
- No global store is in use even though `zustand` is installed
- Server state is fetched ad hoc without caching or normalization

## Key Abstractions

**Synthetic identity:**
- Purpose: Let users log in without exposing email as a product concept
- Examples: `toEmail()` and `toPassword()` in `lib/profileService.ts`
- Pattern: thin auth adapter over Supabase Auth

**Consumption record:**
- Purpose: Core event in the product
- Examples: inserts from `components/DrinkForm.tsx`, `components/DrinkPicker/DrinkList.tsx`, `components/DrinkPicker/DrinkQuantitySheet.tsx`
- Pattern: direct table writes from UI

**Drink catalog projection:**
- Purpose: Adapt `drinks` table rows to UI-ready drink cards
- Examples: `components/DrinkPicker/hooks/useDrinkPicker.ts`
- Pattern: fetch + transform in hook

## Entry Points

**Home route:**
- Location: `app/page.tsx`
- Triggers: visit to `/`
- Responsibilities: session/profile bootstrap and routing to setup or dashboard

**Dashboard route:**
- Location: `app/dashboard/page.tsx`
- Triggers: visit to `/dashboard`
- Responsibilities: load profile and mount dashboard UI

**Legacy user route:**
- Location: `app/[user]/page.tsx`
- Triggers: visit to old user-based URL
- Responsibilities: redirect to `/dashboard`

**Keepalive API:**
- Location: `app/api/keepalive/route.ts`
- Triggers: scheduled GET request
- Responsibilities: prevent Supabase inactivity pause

## Error Handling

**Strategy:** Localized handling at component/service boundary

**Patterns:**
- `try/catch` in services and some components
- Redirect to `/` when session/profile is missing
- Toasts for user-facing failure states
- `console.error` / `console.warn` for diagnostics

## Cross-Cutting Concerns

**Validation:**
- PIN validation and formatting in `lib/pinUtils.ts`
- Username formatting in `lib/profileService.ts`
- Most other inputs are validated inline in components

**Authentication:**
- Supabase session lookups are partially centralized through `lib/session.ts`
- The app still relies on client-side session reads in several places

**Styling and motion:**
- Shared tokens in `app/globals.css` and `tailwind.config.js`
- Radix UI primitives wrapped in `components/ui/*`
- Motion handled directly in feature components via `framer-motion`

---
*Architecture analysis: 2026-03-26*
*Update when major patterns change*
