# Technology Stack

**Analysis Date:** 2026-03-26

## Languages

**Primary:**
- TypeScript 5.3 - Application code across `app/`, `components/`, `hooks/`, `lib/`, `types/`

**Secondary:**
- JavaScript - Build and framework config in `next.config.js`, `tailwind.config.js`, `postcss.config.js`
- CSS - Global styling in `app/globals.css`

## Runtime

**Environment:**
- Node.js 18+ - Required by README for local development
- Browser runtime - Most product logic runs client-side in React components

**Package Manager:**
- npm - Scripts defined in `package.json`
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.2 - App Router app with pages in `app/`
- React 18.2.0 - Client components and hooks
- Tailwind CSS 3.4.1 - Utility styling and custom theme tokens

**UI/UX:**
- Radix UI primitives - Dialogs, sheets, select, alert dialog
- framer-motion 12.15.0 - UI transitions and animated counters
- lucide-react 0.511.0 - Icon set
- react-hot-toast 2.5.2 - Toast notifications

**Backend/Data:**
- @supabase/supabase-js 2.39.7 - Auth, database queries, RPC access
- next-pwa 5.6.0 - Service worker generation and runtime caching

**Testing:**
- Vitest 3.2.4 - Unit test runner
- Testing Library + jsdom - Browser-like environment for tests

## Key Dependencies

**Critical:**
- `next` - Routing, bundling, server/runtime integration
- `react` / `react-dom` - Component rendering
- `@supabase/supabase-js` - Identity and persistence layer
- `framer-motion` - Animated dashboard and picker interactions
- `next-pwa` - PWA/service worker support

**Infrastructure:**
- `eslint` + `eslint-config-next` - Linting gate
- `typescript` - Static typing
- `tailwindcss` + `tailwindcss-animate` - Styling system

## Configuration

**Environment:**
- `.env.local` for local secrets
- Public client config: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server-side keepalive config: `SUPABASE_SERVICE_ROLE_KEY`, `KEEPALIVE_SECRET`

**Build:**
- `next.config.js` - PWA config, caching headers, Turbopack root
- `tailwind.config.js` - Color system, typography, shadows
- `tsconfig.json` - TypeScript config and `@/` alias
- `vitest.config.ts` - Test environment and coverage scope

## Platform Requirements

**Development:**
- Any platform with Node.js 18+ and npm
- Supabase project with required tables/RPC already provisioned

**Production:**
- Vercel is the implied hosting target via `vercel.json`
- Supabase project for auth and data
- Cron support for `/api/keepalive`

---
*Stack analysis: 2026-03-26*
*Update after major dependency changes*
