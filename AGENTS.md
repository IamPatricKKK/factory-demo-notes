# AGENTS.md

Conventions for every agent working in this repo. Follow the `items` module as the reference implementation, and copy its shape for new features.

## Layout

| Path | What lives there |
| --- | --- |
| `apps/api` | NestJS 12 API (ESM), MikroORM 7 on PostgreSQL. All routes are under `/api`. |
| `apps/web` | React 19 + Vite. Calls the API through `src/api.ts` with relative `/api/...` URLs. |
| `e2e` | Playwright tests, one file per user story. Owned by QA. |
| `docs` | PRD, TechDesign and other artifacts. |
| `deploy` | Compose file used on the VPS. Owned by CI, do not edit. |
| `.github` | CI workflows. Do not edit. |

## Commands

Run these before you say a task is done. All of them must pass.

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm test                 # unit tests (vitest), no database
pnpm test:integration     # API tests against real Postgres; needs DATABASE_URL
pnpm build
```

Full stack locally: `docker compose up -d --build --wait`, then `pnpm test:e2e` (the app runs at http://localhost:8080).

## Adding a backend feature

1. Entity: `apps/api/src/<feature>/<name>.entity.ts`, using `defineEntity` + `p` (see `item.entity.ts`). Register it in `src/mikro-orm.config.ts` under `entities`.
2. Migration: `pnpm --filter api migration:create`. This needs a running database. Commit the generated file in `src/migrations`. Never edit a migration that has already been merged.
3. DTOs: `<name>.dto.ts` with `class-validator` decorators. Every request body goes through a DTO; the global `ValidationPipe` rejects unknown fields.
4. Service: inject `EntityManager` from `@mikro-orm/postgresql`. Throw `NotFoundException` and friends, never return `null` to the controller.
5. Controller + module, then import the module in `app.module.ts`.
6. Tests: one unit spec next to the service (`*.spec.ts`, mock the `EntityManager`), and an integration test in `apps/api/test/*.e2e-spec.ts` that uses `setupApp()` and supertest.

Imports between local files use the `.js` extension (`./items.service.js`), because the API is ESM.

## Database migrations must be backward compatible

Production rollback redeploys the previous image against the same database, so the previous code must still work after your migration runs.

- Allowed: add a table, add a nullable column, add a column with a default, add an index.
- Not allowed in the same release: drop or rename a column or table, change a column's type, add `NOT NULL` without a default.
- To remove or rename something, do it across two releases: stop using it first, then drop it in a later release.

## Frontend and test IDs

- Every element that an acceptance criterion mentions gets a `data-testid` in kebab-case: `<entity>-<element>`, for example `item-input`, `item-add`, `item-row`, `item-toggle`, `item-delete`. Use the exact names listed in the TechDesign's `uiContract`.
- Inputs have a visible `<label>`, icon-only buttons have an `aria-label`, and errors render in an element with `role="alert"`. Hidden eval tests use `getByRole` and `getByLabel`, so these are required, not optional.
- Lists render one `<entity>-row` per record so tests can filter rows by text.

## E2E tests (QA)

- One file per user story: `e2e/tests/<story-id lowercase>-<slug>.spec.ts`, with the test name starting with the story ID (`US-01: ...`).
- Locate elements by `getByTestId` from the `uiContract`, or by role and label. Never use CSS classes or DOM structure.
- Controls that update only after the API answers (checkboxes, toggles) are clicked with `click()` and then asserted with `expect(...).toBeChecked()`. Don't use `check()` on them.
- Use unique data per test (for example `Date.now()` in titles), because tests run against a shared database.

## Rules

- Dev branches (`task/*`) must not change `e2e/`, `.github/`, `deploy/` or `.env*`. QA branches (`qa/*`) may only change `e2e/`. The `guard-paths` CI check enforces this.
- Never delete, skip (`.skip`, `.only`) or weaken an existing test to make CI pass. If a test is wrong, say so in your result instead.
- Never commit secrets. Configuration comes from environment variables. CI runs gitleaks on every push.
- Add a dependency only if the existing ones can't do the job. Say why in the PR description.
