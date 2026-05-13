# finance-tracker

Personal finance tracker — an ad-free replacement for Money Mgr. Tracks daily transactions, budgets, and recurring bills with incentives for consistent logging.

## Tech Stack

- **Framework**: Next.js 15 (App Router, standalone output)
- **API**: tRPC v11 + React Query v5
- **Auth**: NextAuth v5 (Discord OAuth, extensible to Google)
- **ORM**: Prisma 6 + PostgreSQL
- **Styling**: Tailwind CSS v4, glass-morphism dark theme
- **Validation**: Zod throughout (env, tRPC inputs)
- **Infra**: Docker (multi-stage), Vercel (prod), Neon (Postgres)

## Common Commands

```bash
npm run dev          # dev server with Turbo
npm run check        # lint + typecheck (run before committing)
npm run db:generate  # generate migration from schema changes
npm run db:migrate   # apply pending migrations
npm run db:studio    # Prisma Studio GUI
```

Path alias: `~/*` → `src/*`

## Architecture

```
src/
  app/             # Next.js App Router pages and layouts
  server/
    api/
      routers/     # Layer 1 — tRPC procedures (input validation + call service only)
      root.ts      # Register all routers here
      utils/       # Shared procedure factories, pagination helpers, error mappers, input schemas
    services/      # Layer 2 — Business logic (pure functions, no HTTP concerns)
    db/            # Layer 3 — Prisma queries (data access only, no business logic)
    auth/          # NextAuth config and session utilities
    db.ts          # Prisma client singleton
  components/      # Reusable UI components
  hooks/           # Custom React hooks
  lib/             # Utility functions
  types/           # Shared TypeScript interfaces
  trpc/            # tRPC client setup (react.tsx, server.ts)
  env.js           # Zod environment validation (add new env vars here)
```

**Rules:**
- Server-only code lives in `src/server/` — guard with `server-only` package
- New tRPC routes: add router in `src/server/api/routers/`, register in `src/server/api/root.ts`
- Never commit `.env` — use `.env.example` as the template

## Backend Code Practices

### 3-Layer Service Architecture

Every backend feature follows a strict 3-layer pattern. **No layer may skip a layer.**

```
tRPC Router  →  Service  →  DB module
(validation)    (logic)     (queries)
```

**Layer 1 — Router** (`src/server/api/routers/<domain>.ts`)
- Responsible for: input validation (Zod), calling the service, returning output
- Must NOT contain business logic or direct Prisma calls
- Always uses `ctx.session.user.id` for the authenticated user ID

```typescript
// ✅ Correct — router delegates to service
export const transactionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTransactionInput)
    .mutation(({ ctx, input }) =>
      TransactionService.create(ctx.db, ctx.session.user.id, input)
    ),
});

// ❌ Wrong — business logic in the router
export const transactionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTransactionInput)
    .mutation(async ({ ctx, input }) => {
      const budget = await ctx.db.budget.findFirst(...); // belongs in service
      if (budget && ...) { ... }                         // belongs in service
      return ctx.db.transaction.create(...);             // belongs in db layer
    }),
});
```

**Layer 2 — Service** (`src/server/services/<domain>.ts`)
- Responsible for: business logic, orchestration, calling the DB layer
- Receives `db` (PrismaClient) as a parameter — no direct `ctx` access
- Pure functions where possible — easier to test

```typescript
// src/server/services/transaction.ts
export const TransactionService = {
  async create(db: PrismaClient, userId: string, input: CreateTransactionInput) {
    // business logic lives here (e.g. check budget, update recurring bill)
    return TransactionDB.create(db, { ...input, userId });
  },
};
```

**Layer 3 — DB** (`src/server/db/<domain>.ts`)
- Responsible for: Prisma queries only — no logic, no conditions beyond what's needed for the query
- Returns raw Prisma results — no transformation

```typescript
// src/server/db/transaction.ts
export const TransactionDB = {
  create: (db: PrismaClient, data: Prisma.TransactionCreateInput) =>
    db.transaction.create({ data }),

  findByUser: (db: PrismaClient, userId: string) =>
    db.transaction.findMany({ where: { userId }, orderBy: { date: "desc" } }),
};
```

### tRPC Procedure Utils (`src/server/api/utils/`)

Shared utilities that all routers import from:

| Util | File | Purpose |
|---|---|---|
| Base procedures | `procedures.ts` | `protectedProcedure` / `publicProcedure` with common middleware |
| Pagination | `pagination.ts` | `paginationInput` Zod schema + `paginatedResponse` wrapper |
| Error mapper | `errors.ts` | Convert service errors → typed `TRPCError` consistently |
| Input schemas | `inputs.ts` | Composable Zod pieces: `dateRangeInput`, `amountInput`, `categoryInput` |

```typescript
// Usage in a router
import { paginationInput, dateRangeInput } from "~/server/api/utils/inputs";
import { mapToTRPCError } from "~/server/api/utils/errors";

// Compose shared inputs
.input(z.object({ ...paginationInput.shape, ...dateRangeInput.shape }))
```

---

## Domain Model

Core entities (Phase 1):

| Model | Key Fields |
|---|---|
| Transaction | date, amount, type (income/expense), category, notes, userId |
| Budget | category, limit, period (monthly/weekly), userId |
| RecurringBill | name, amount, frequency, nextDueDate, userId |

The sample `Post` model can be removed once finance models are in place.

## Frontend Code Practices

### Design System & Tailwind Audit

All design tokens are defined in `tailwind.config.ts`. **Arbitrary Tailwind values are prohibited** — if a value isn't in the config, add it as a token first.

**Enforced automatically** via `eslint-plugin-tailwindcss` in CI. Arbitrary values (`w-[347px]`, `text-[#3a1f9d]`, `mt-[13px]`) will fail the lint check.

```bash
npm install -D eslint-plugin-tailwindcss   # add once
npm run check                              # catches violations
```

#### Token Categories (defined in `tailwind.config.ts`)

**Colors** — no raw hex values in components, ever:
```ts
colors: {
  brand: {
    primary:   "#...",   // main CTA color
    accent:    "#...",   // highlights
  },
  surface: {
    base:      "#...",   // page background
    elevated:  "#...",   // card/glass surface
    overlay:   "#...",   // modal overlay
  },
  semantic: {
    income:    "#...",   // green — positive amounts
    expense:   "#...",   // red — negative amounts
    warning:   "#...",   // amber — budget threshold
    danger:    "#...",   // red — over budget
  },
}
```

**Typography** — use named scale, not arbitrary sizes:
```ts
fontSize: {
  "display": [...],   // page titles
  "heading": [...],   // section headings
  "body":    [...],   // default text
  "caption": [...],   // labels, metadata
}
```

**Spacing** — extend the default scale with project-specific tokens if needed; never use arbitrary values.

**Glass-morphism tokens** — define once, use by name:
```ts
borderRadius: { glass: "1rem" },
boxShadow:    { glass: "0 4px 30px rgba(0, 0, 0, 0.1)" },
```

#### Component Rules

- Use token classes: `bg-surface-elevated`, `text-semantic-income`, `shadow-glass`
- Conditional styling via `clsx` or `cn()` utility — never string concatenation
- No inline `style` props for values that belong in the design system
- When adding a new visual pattern, define the token first, then use it

---

## Development Workflow

- **Branches**: feature branches off `main` — e.g. `feat/transaction-crud`, `fix/budget-calc`
- **PRs**: always merge via PR; `main` is branch-protected
- **CI checks**: lint + typecheck run in CI — no pre-commit hooks needed locally
- **PR Review**: run the `pr-review` agent on every PR before merging (see below)

## Product Roadmap

**Phase 1 (current)** — Web app
- [ ] Transaction CRUD
- [ ] Budget management
- [ ] Recurring bills
- [ ] Reports and analytics
- [x] Discord login

**Phase 2** — Expansion
- Google login + sync to Discord
- Electron desktop app with offline transactions and sync

**Phase 3** — Experimentation
- Spec Driven Development features
- iOS app

## Pending To-Dos

1. ~~Install T3~~ (done)
2. Deploy to Vercel
3. Deploy Postgres to Neon
4. Setup `main` branch protection
5. Setup Claude Skills and agents (see below)
6. Build Transaction CRUD (first feature)

## Claude Integration

### Skills

Invoke these with `/skill-name` in Claude Code:

| Skill | When to use |
|---|---|
| `/simplify` | After implementing a feature — review for quality and reuse |
| `/commit` | Generate a conventional commit message |
| `/claude-api` | When building Claude-powered features (smart categorization, analytics summaries) |

### Agents

Defined in `.claude/agents/`. Invoke by mentioning the agent or using `@agent-name`:

| Agent | Purpose |
|---|---|
| `frontend-css-architect` | Tailwind styling, glass-morphism components, class organization |
| `backend-api` | tRPC routers, Prisma queries, server-side logic, Zod validation |
| `db-migration` | Prisma schema design, safe migrations, index strategy |
| `finance-domain` | Finance logic — categories, budget calculations, report math |
| `pr-review` | Code review before merging: type safety, security, perf, conventions |

### Claude PR Review

Before merging any PR, invoke the `pr-review` agent. It produces structured feedback with **blocking** and **non-blocking** comments covering:
- TypeScript type safety
- Security (no secret leaks, Prisma protects against injection)
- Performance (query efficiency, N+1)
- Project conventions (file placement, naming, server-only guards)
