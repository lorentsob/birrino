# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Runner:**
- Vitest 3.x
- Config in `vitest.config.ts`

**Assertion Library:**
- Vitest built-in `expect`
- Extended DOM matchers via `@testing-library/jest-dom`

**Run Commands:**
```bash
npm run test
npm run test:coverage
npm run lint
npm run build
```

## Test File Organization

**Location:**
- Tests live adjacent to source files
- Current examples: `lib/calculations.test.ts`, `lib/consumptionService.test.ts`

**Naming:**
- Unit tests use `*.test.ts`
- No integration or e2e naming convention is currently present

**Current structure:**
```text
lib/
  calculations.ts
  calculations.test.ts
```

## Test Structure

**Suite Organization:**
```ts
describe("module", () => {
  beforeEach(() => {
    // optional shared setup
  });

  it("should ...", () => {
    // arrange
    // act
    // assert
  });
});
```

**Patterns in use:**
- `describe` blocks grouped by exported function
- `beforeEach` / `afterEach` used for fake timers
- Tests target deterministic pure logic

## Mocking

**Framework:**
- Vitest `vi`

**Patterns observed:**
- `vi.useFakeTimers()` / `vi.setSystemTime()` for time-sensitive logic
- `vi.mock()` / `vi.hoisted()` are used for service-level Supabase mocks

**What is mocked today:**
- Time and date behavior only
- Supabase client for service tests

**What is not tested/mocked today:**
- Supabase client
- Route handlers
- React components
- Navigation
- Toasts, dialogs, and motion-heavy UI

## Coverage

**Configured scope:**
- Coverage includes `lib/**/*.ts`

**Actual state:**
- `lib/calculations.ts` and `lib/consumptionService.ts` are covered by tests
- Most UI-driven business-critical flows are still untested

## Manual Verification Patterns

- Repository guidance in `agents.md` relies on `npm run lint` as the required gate
- `npm run build` is optional but recommended for production validation
- There is no documented browser-based UAT script in the repository root

## Recommended Matching Style For New Tests

- Add tests adjacent to implementation
- Use Vitest + Testing Library for component work
- Mock Supabase at module boundaries rather than hitting real services
- Preserve the existing `describe` / `it("should ...")` naming style

## High-Risk Coverage Gaps

- `components/SetupScreen.tsx` and `lib/profileService.ts` for sign-up/login flow
- `components/DashboardClient.tsx` for aggregation and threshold behavior
- `components/DrinkPicker/*` and `components/DrinkForm.tsx` for insert flows
- `app/api/keepalive/route.ts` for auth and DB lifecycle behavior

---
*Testing analysis: 2026-03-26*
*Update when component/integration tests are introduced*
