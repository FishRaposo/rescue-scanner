# Security policy

This is a portfolio project: a static analyzer that reads repository source and
reports ranked findings. It never probes, scans or sends requests to a live
deployed application, and it has no hosted deployment.

It is an engineering review, **not** a security certification or a penetration
test. Every rule documents its blind spot in [docs/RULES.md](docs/RULES.md).

## Reporting a vulnerability

Open a [security advisory](https://github.com/FishRaposo/rescue-scanner/security/advisories/new)
or email fishraposo@gmail.com with the subject `[rescue-scanner security]`. Please
do not open a public issue for a security report.

A finding in someone else's repository should go to that maintainer privately
first, not into a public issue here.

## Supported versions

Security fixes target `main` and the latest tagged release.
