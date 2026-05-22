# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report security vulnerabilities by opening an issue with the `security` label, or by emailing the maintainers directly.

## Security Considerations

- **Credentials**: Never hardcode VULMS credentials. Use environment variables.
- **Session cookies**: The SDK stores session cookies in memory. Do not log or serialize them.
- **HTML snapshots**: Debug snapshots may contain sensitive data. Do not commit `debug/` to version control.
- **Playwright**: Browser automation runs in a controlled environment. Do not use untrusted HTML in browser context.
