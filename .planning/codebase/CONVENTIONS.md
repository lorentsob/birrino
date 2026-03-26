# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Files:**
- React components use `PascalCase.tsx`
- Utilities and hooks use `camelCase.ts`
- Tests use `*.test.ts` alongside the module under test

**Functions:**
- General functions use `camelCase`
- Event handlers often use `handle*`, e.g. `handleSignup`, `handleQuickAdd`
- Async functions do not use special prefixes; they are named by intent (`fetchDrinks`, `loadProfile`)

**Variables:**
- Local variables use `camelCase`
- Constants use `UPPER_SNAKE_CASE` in `lib/constants.ts`
- Temporary Supabase results often use `{ data, error }` naming straight from SDK responses

**Types:**
- Interfaces and types use `PascalCase`
- Feature-local types are often colocated near components (`components/DrinkPicker/types.ts`)

## Code Style

**Formatting:**
- Double quotes throughout
- Semicolons are used consistently
- Imports are generally grouped but not strictly normalized by linter
- JSX class strings are often long and inline rather than extracted

**Linting:**
- ESLint via `eslint . --max-warnings=0`
- Repository rule from `agents.md`: run `npm run lint` after every change

## Import Organization

**Order typically used:**
1. React / framework imports
2. Internal alias imports from `@/`
3. Relative imports

**Grouping:**
- Blank lines are used inconsistently
- Type-only imports are not consistently separated

**Path Aliases:**
- `@/` points to repository root via `tsconfig.json` and `vitest.config.ts`

## Error Handling

**Patterns:**
- Expected failures in UI are often handled inline with toasts or redirects
- Utility/service modules sometimes return objects like `{ success, error }` instead of throwing
- `try/catch` is used selectively around async boundaries

**Logging:**
- `console.error` and `console.warn` are used directly
- There is no centralized error or logging abstraction

## Comments

**When to Comment:**
- The codebase uses both JSDoc-style comments in `lib/` and banner comments in components
- Comments often explain transitions or migration context, not only current behavior

**Observed Pattern:**
- Some comments are stale, especially around anonymous sessions and migration history
- Comments should be treated as hints, not always as current truth

## Function Design

**General style:**
- Guard clauses are common
- Data fetching logic often lives inside components/hooks instead of a dedicated service
- Derived UI data is computed with `useMemo` when it affects rendering performance or readability

**Parameters and returns:**
- Small function signatures are preferred
- Service functions often return plain objects instead of custom result types

## Module Design

**Exports:**
- Default exports are common for page components and some leaf components
- Named exports are common for shared hooks and utility functions

**Boundaries:**
- `lib/` holds reusable logic
- Feature directories may still reach directly into Supabase rather than consuming `lib/` APIs

## Repository-Specific Patterns

- Session access is moving toward small reusable helpers such as `lib/session.ts`
- Product copy is predominantly Italian, while many internal comments and identifiers are English
- UI styling combines Tailwind utilities, CSS custom properties, and wrapper components in `components/ui/*`

---
*Conventions analysis: 2026-03-26*
*Update when linting/style conventions are standardized further*
