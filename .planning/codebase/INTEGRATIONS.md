# External Integrations

**Analysis Date:** 2026-03-26

## APIs & External Services

**Supabase:**
- Used for auth, Postgres access, and RPC calls
  - SDK/Client: `@supabase/supabase-js` via `lib/supabaseClient.ts`
  - Auth: browser anon key for client SDK, service role for keepalive route
  - Endpoints used: Auth session endpoints, table CRUD, RPC `check_username_available`

## Data Storage

**Database:**
- Supabase Postgres
  - Accessed directly from the browser in most user flows
  - Typed through `types/supabase.ts`
  - Expected tables inferred from code: `profiles`, `drinks`, `consumption`, `favorites`, `recents`

**Storage / Files:**
- No user upload storage integration present
- Static assets are served from `public/`

**Caching:**
- Service worker caching from `next-pwa`
  - Supabase requests: `NetworkFirst`
  - Next static assets: `CacheFirst`

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: `lib/profileService.ts`
  - Session management: Supabase browser session via `supabase.auth.getSession()`
  - User-facing identity: username + 4-digit PIN
  - Internal identity detail: username converted to synthetic email `username@birrino.local`

## Monitoring & Observability

**Error Tracking:**
- None found

**Analytics:**
- None found

**Logs:**
- Browser/server `console.*` logging only

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from `vercel.json` and Next.js deployment shape)
  - Cron configured in `vercel.json` for `/api/keepalive`
  - Environment variables expected in Vercel dashboard

**CI Pipeline:**
- GitHub Actions
  - Workflow: `.github/workflows/keepalive.yml`
  - Purpose: send keepalive request every 3 days
  - Secrets: `KEEPALIVE_URL`

## Environment Configuration

**Development:**
- Required env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional but required for keepalive locally:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `KEEPALIVE_SECRET`
- Secrets location: `.env.local`

**Production:**
- Secrets are assumed to be managed by Vercel and GitHub
- No explicit staging environment found

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- GitHub Actions hits the deployed keepalive endpoint

## Integration Notes

- There is drift between docs and implementation around keepalive auth:
  - `README.md` still documents a `?secret=` query parameter
  - `app/api/keepalive/route.ts` expects `Authorization: Bearer <KEEPALIVE_SECRET>`
- Some optional product features (`favorites`, `recents`) are coded defensively because the backing tables may not exist in every environment.

---
*Integrations analysis: 2026-03-26*
*Update when external services or environment contracts change*
