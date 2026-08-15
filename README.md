# Sprintly Web

Sprintly is a local-first developer productivity product: a private record of focused coding sessions, goals, streaks, achievements, and developer identity.

## Run locally

```bash
pnpm install
pnpm dev
```

Production verification:

```bash
pnpm lint
pnpm build
```

## Product routes

- Public: `/`, `/how-it-works`, `/privacy`, `/pricing`
- Account: `/sign-in`, `/create-account`, `/forgot-password`, `/verify-email`, `/account-recovery`
- Setup: `/onboarding`
- Product: `/app`, `/app/workspace`, `/app/sessions`, `/app/analytics`, `/app/goals`, `/app/profile`, `/app/community`, `/app/settings`, `/app/billing`

## Architecture

The project uses Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query, React Hook Form, Zod, Radix UI, Recharts, Lucide, Lenis, and Sonner.

All data is mocked behind product-ready UI boundaries so authenticated API queries can replace the mock layer without redesigning the interface. The design source of truth lives in [`design-system/sprintly/MASTER.md`](design-system/sprintly/MASTER.md).

## Sprintly development flow

The current development build uses a replaceable demo auth provider and a browser-local persistence adapter. It intentionally does not read VS Code storage, arbitrary local paths, or continuous extension telemetry.

Demo Account:

```text
Email: demo@sprintly.local
Password: SprintlyDemo123!
```

The extension handoff is an explicit `.json` import validated against Sprintly's canonical compatibility contract, `devstrava.session.v1` (`schemaVersion: 1`). The import dialog validates timestamps, ranges, percentages, required fields, malformed records, and duplicate `sessionId` values, then requires confirmation before storing records.

Sprintly routes include `/app`, `/app/sessions`, `/app/sessions/[id]`, `/app/analytics`, `/app/achievements`, `/app/profile`, `/app/community`, `/app/settings`, `/app/share`, `/share/[id]`, and `/profile/[handle]`. The existing workspace, goals, and billing routes remain available.

Pure contract and aggregation tests run with:

```bash
node --experimental-strip-types --test lib/sprintly/logic.test.ts
```

The local adapter is deliberately isolated in `lib/sprintly/storage.ts`; a production implementation can replace it with authenticated API/database calls for auth, sessions, aggregates, profiles, shares, leaderboards, and achievements without changing the UI contract.
