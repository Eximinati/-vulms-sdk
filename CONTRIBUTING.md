# Contributing to vulms-sdk

## Setup

```bash
git clone <repo>
npm install
cp playground/.env.example playground/.env
# Edit playground/.env with your VULMS credentials
```

## Workflow

1. **Write tests first** — all new features need tests in `tests/`
2. **Run `npm run typecheck`** before committing
3. **Run `npm run test`** — all 72 tests must pass
4. **Run `npm run build`** — must produce clean CJS/ESM/DTS builds
5. **Do not commit `.env`** — it contains real credentials

## Code Conventions

- TypeScript strict mode — no `any`, no implicit any
- No comments unless explaining non-obvious logic
- Logger parameter optional with `noopLogger` default
- All parsers accept `Logger` parameter for observability
- All modules accept `snapshots` boolean for debug capture

## Adding a New Module

1. Create `src/types/newmodule.ts` with Zod schema + TypeScript types
2. Create `src/parsers/newmodule-parser.ts` with `parseNewModules(html, logger)`
3. Create `src/modules/newmodule.ts` with PostBack navigation pattern
4. Export from `src/modules/index.ts` and `src/parsers/index.ts`
5. Add tests in `tests/parsers/`
6. Create `playground/test-newmodule.ts`

## Debugging

```bash
DEBUG=true npm run dev:report
```

This enables:
- Console debug logging with namespace prefixes
- HTML snapshots in `debug/{category}/`
- HTTP request tracing

## VULMS Navigation

- All authenticated pages go through `/Home.aspx` PostBack
- Course index from `id.match(/_(\d+)$/)` on `ibtn*` buttons
- Event target: `ctl00$MainContent$gvCourseList$ctl${NN}$ibtnAssignments`
