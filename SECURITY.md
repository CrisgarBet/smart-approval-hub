# Security policy

## Supported version

This demonstration project supports the latest revision of the `main` branch.

## Reporting a vulnerability

Do not publish credentials, personal data, exploit details, or proof-of-concept payloads in a public issue. Use GitHub's private vulnerability reporting feature for this repository instead.

## Deployment notes

- Replace all example credentials before exposing the stack outside a local machine.
- Configure `POWER_APPS_DEMO_KEY` with a strong secret and publish the API only through HTTPS.
- Keep `.env`, certificates, generated connector settings, database files, logs, and screenshots outside Git.
- The default database credentials and localhost URLs are for local demonstration only.
