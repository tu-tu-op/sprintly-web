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
