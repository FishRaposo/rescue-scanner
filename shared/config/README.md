# shared/config

Shared configuration baselines.

## Frontend

- `tsconfig.json`: strict, no implicit any, path alias `@/*`.
- ESLint and Prettier baselines.
- `package.json` scripts: `dev`, `verify`, `build:demo`, `check:live`, `cards`.

## Backend

- `pyproject.toml`: ruff, pytest, mypy/pyright.
- Python 3.11+.
- No mandatory database server or provider SDK.

## Files

- `.gitignore`: node_modules, dist, data files, env files.
- `.nojekyll` for Pages.
- `404.html` template.
- No secrets, credentials or environment-specific values.

## Acceptance

- A fresh clone installs and runs with the documented commands.
- The config files contain no machine-specific paths.
- The same config works on Windows, macOS and Linux.
