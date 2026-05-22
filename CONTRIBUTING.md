## Naming conventions

This repository uses snake_case for identifiers (variables, functions, properties) and snake_case for database table and column names.

How this is enforced

- ESLint is configured with `@typescript-eslint/naming-convention` to require `snake_case` for `variableLike` and `function` selectors. See `eslint.config.mjs`.
- Use the workspace setting to auto-fix lint issues on save (VS Code `.vscode/settings.json`).

Guiding GitHub Copilot

- Copilot doesn't expose a direct "naming style" toggle. The best ways to get Copilot to follow snake_case are:
  - Provide examples in the repository: code, tests, and examples using snake_case.
  - Keep `eslint` rules active and run `source.fixAll.eslint` on save so Copilot suggestions are quickly corrected.
  - Add a short comment at the top of new files: `/* style: snake_case */` — Copilot often picks up local hints.

Pre-commit / CI

- Recommended: add `husky` + `lint-staged` to run `eslint --fix` before commit and fail CI if lint errors remain.
