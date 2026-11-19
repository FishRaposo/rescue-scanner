# Verification record — <repo>

**CLIs:** use the CLI table in [CLI_CONTRACT](CLI_CONTRACT.md); the tables below are the web-app checks.

## Local, no infrastructure

| Check | Command | Expected | Date | Result |
|---|---|---|---|---|
| Install | `<install command>` | dependencies installed | | |
| Run | `<one-command launcher>` | app opens with seeded data | | |
| Tests | `<verify command>` | all suites green | | |
| Build | `<build command>` | production build succeeds | | |
| Demo build | `<demo command>` | static export succeeds | | |

Environment: OS, Node version, Python version, no Docker/WSL, no keys.

## Live demo

| Check | URL | Expected | Date | Result |
|---|---|---|---|---|
| Sample data label | | visible | | |
| Deep link | | boots | | |
| Off-origin requests | | zero | | |
| Console | | clean | | |

## Notes

Unverified items stay explicit. Do not record a skip as a pass.
