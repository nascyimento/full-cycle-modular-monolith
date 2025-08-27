# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/modules` following DDD-style boundaries: `<context>/{domain,gateway,repository,facade,usecase,factory}` plus shared utilities in `src/modules/@shared`.
- Example: `src/modules/product-adm/domain/product.entity.ts`, `.../usecase/check-stock/check-stock.usecase.ts`.
- Tests are colocated and named `*.spec.ts` next to the unit under test.

## Build, Test, and Development Commands
- `npm test`: Type-checks (`tsc --noEmit`) then runs Jest with SWC.
- `npm run tsc`: Compiles TypeScript according to `tsconfig.json`.
- Useful examples:
  - Run one file: `npx jest src/modules/payment/facade/payment.facade.spec.ts`
  - Filter by name: `npx jest -t "should approve"`
  - Watch mode: `npx jest --watch`

## Coding Style & Naming Conventions
- Language: TypeScript with decorators enabled (SWC). Use 2-space indentation, semicolons, and double quotes for strings.
- Naming: PascalCase for classes (`Product`), camelCase for variables/functions, kebab-case for filenames (`check-stock.usecase.ts`).
- Common suffixes: `.entity.ts`, `.usecase.ts`, `.facade.ts`, `.repository.ts`, `.model.ts`.
- Linting: TSLint (extends `tslint:recommended`). Optionally run `npx tslint -p tsconfig.json` before pushing.

## Testing Guidelines
- Framework: Jest (`@swc/jest`). Keep tests fast and isolated.
- Database: Use in-memory SQLite via `sequelize-typescript` as in existing specs; do not depend on external services.
- Conventions: One `describe` per unit, clear `it` names; keep fixtures minimal and local.
- Coverage: No hard threshold enforced; prefer adding/maintaining tests with new code.

## Commit & Pull Request Guidelines
- Commits: Prefer Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`). Example: `feat(product-adm): add check stock use case`.
- PRs: Include a clear description, scope, and rationale; link issues when relevant. Add test evidence (command/output) and note any architectural impacts (new use case, model, or facade).
- CI expectations: `npm test` must pass; keep diffs focused and adhere to the module layout above.

## Architecture Notes
- Modules expose facades and factories to compose use cases; repositories persist via Sequelize models. Favor small, testable use cases and keep cross-module sharing inside `@shared`.
