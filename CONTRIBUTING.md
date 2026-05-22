# Contributing to vulms-sdk

## Development Setup

```bash
git clone https://github.com/your-org/vulms-sdk.git
cd vulms-sdk
npm install
```

## Running Tests

```bash
npm run test        # Run all tests
npm run typecheck   # TypeScript type check
npm run build       # Build CJS + ESM + DTS
```

## Live Testing (requires VULMS credentials)

Create a `.env` file:

```
VULMS_ID=BC000000000
VULMS_PASSWORD=your_password
```

Then run:

```bash
npm run dev:login
npm run dev:assignments
npm run dev:activities
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Run tests (`npm run test`)
4. Run typecheck (`npm run typecheck`)
5. Commit changes (`git commit -m 'feat: add my feature'`)
6. Push to your fork and open a PR

## Code Style

- TypeScript strict mode
- No `any` types
- Follow existing patterns
- Add tests for new functionality

## Release Process

Releases follow semantic versioning:

- `0.1.0-beta.1` — beta releases
- `0.1.0` — stable release
