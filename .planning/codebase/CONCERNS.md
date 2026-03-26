# Codebase Concerns

**Analysis Date:** 2026-03-26

## Tech Debt

**Client-side auth/data coupling:**
- Issue: Session reads and Supabase table access still live largely inside client components/hooks
- Why: The product started as a fast-moving client-heavy implementation
- Impact: Cross-cutting data changes still require touching several UI files
- Fix approach: Continue extracting small shared services where duplication appears

**Direct Supabase access from UI:**
- Issue: Components and feature hooks perform their own reads/writes instead of using a central domain service
- Why: Faster to ship the initial product
- Impact: Insert/query logic is duplicated, error handling diverges, schema changes are harder to roll out safely
- Fix approach: Extract shared flows such as "get current session user", "insert consumption", "load dashboard data"

**Repository drift and leftover artifacts:**
- Issue: Historical documentation still exists, even though the main setup docs were aligned
- Why: Some migration context remains useful, but it can still mislead if treated as authoritative
- Impact: Developers may still read old notes before current docs
- Fix approach: Keep `README.md` authoritative and quarantine historical notes clearly

## Known Bugs

No confirmed open bugs documented after the stabilization pass.

## Security Considerations

**Username + 4-digit PIN auth:**
- Risk: Effective secret strength is low even if Supabase hashes and rate limits server-side
- Current mitigation: Supabase Auth handles hashing; login errors are generalized; credentials are not stored in app code
- Recommendations: Consider stronger PIN policy, failed-attempt monitoring, or optional second factor if the threat model grows

**Client-side direct table access:**
- Risk: Data safety depends heavily on correct Supabase RLS and table design
- Current mitigation: Session-based access via Supabase client
- Recommendations: Verify RLS policies explicitly, document required policies, and move sensitive writes behind server endpoints when needed

## Performance Bottlenecks

**Dashboard aggregation:**
- Problem: `components/DashboardClient.tsx` fetches the full user consumption history and computes aggregates on the client
- Measurement: No profiling data in repo
- Cause: Simplicity over query optimization
- Improvement path: Move period aggregation into SQL views/RPC or paginate historical list separately from summary metrics

**Repeated session lookups:**
- Problem: Many components call `supabase.auth.getSession()` independently
- Measurement: No instrumentation present
- Cause: No shared session context/hook
- Improvement path: Centralize current-user/session state once per page tree

## Fragile Areas

**Drink insertion flow:**
- Why fragile: There are multiple write paths with slightly different payloads and error handling
- Common failures: Divergence between UI entry points if the shared service is bypassed
- Safe modification: Keep all insert paths routed through `lib/consumptionService.ts`
- Test coverage: Service-level coverage only

**Favorites and recents:**
- Why fragile: Features assume optional tables that may not exist in all environments
- Common failures: Silent degradation or console errors when tables are absent
- Safe modification: Treat these as feature-flagged integrations with explicit setup checks
- Test coverage: None

## Scaling Limits

**Consumption history loading:**
- Current capacity: Suitable for small personal datasets
- Limit: As consumption rows grow, dashboard load time and client aggregation cost will increase
- Symptoms at limit: Slower first paint, heavier JS work, longer query time
- Scaling path: Split recent history from aggregated summaries and move heavy aggregation server-side

## Dependencies at Risk

**Supabase schema contract:**
- Risk: The repository does not contain a current migration/source-of-truth for all tables/RPC used by the app
- Impact: New environments can drift or boot incompletely
- Migration plan: Add authoritative SQL migrations or setup docs for current schema

**Unused installed dependencies:**
- Risk: Packages like `zustand` appear installed but unused
- Impact: Larger dependency surface and confusion about intended architecture
- Migration plan: Remove unused packages or introduce them intentionally

## Missing Critical Features

**Automated coverage for user-critical flows:**
- Problem: Authentication, dashboard data loading, and keepalive behavior are not protected by tests
- Current workaround: Manual verification and lint/build runs
- Blocks: Safe refactoring of auth/data flows
- Implementation complexity: Medium

## Test Coverage Gaps

**Auth and session bootstrap:**
- What's not tested: `app/page.tsx`, `app/dashboard/page.tsx`, `lib/profileService.ts`
- Risk: Login and redirect regressions can ship unnoticed
- Priority: High
- Difficulty to test: Medium

**Drink management UI:**
- What's not tested: `components/DrinkForm.tsx`, `components/DrinkPicker/*`, favorites/recents hooks
- Risk: Broken inserts or degraded UX on the main action path
- Priority: High
- Difficulty to test: Medium

**Operational endpoint:**
- What's not tested: `app/api/keepalive/route.ts`
- Risk: Keepalive could silently fail in production while docs still look correct
- Priority: Medium
- Difficulty to test: Low to medium

---
*Concerns audit: 2026-03-26*
*Update as issues are fixed or new ones discovered*
