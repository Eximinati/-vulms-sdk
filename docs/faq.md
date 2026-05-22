# vulms-sdk FAQ

## General

**What is vulms-sdk?**
A TypeScript SDK for Virtual University LMS (VULMS) that provides a clean, typed API for fetching assignments, quizzes, GDBs, lectures, and courses.

**Is this an official VULMS product?**
No. This is a third-party SDK built by developers for developers. Not affiliated with VU.

**Do I need VULMS credentials?**
Yes. You need your VU student ID and password. The SDK never stores them to disk.

## Technical

**Why does login require Playwright?**
VULMS uses Google reCAPTCHA v3 on the login page. Playwright simulates a real browser, executing JavaScript and bypassing the captcha.

**Can I use raw HTTP login?**
Yes (`sdk.login()`), but it may be blocked by reCAPTCHA. Playwright is the recommended approach.

**How does caching work?**
Dashboard HTML is cached once after login. Module outputs are cached with a 5-minute TTL. Cache-hit returns a deep copy — identical structure to a fresh fetch.

**How does smart traversal work?**
The dashboard page contains icons/buttons for each course. The SDK extracts which courses have assignments, quizzes, GDBs, and lectures. Courses without a button are skipped entirely.

## Stability

**Is this production ready?**
Yes. The SDK has 150 tests, 25x stress testing, bounded memory (< 100MB), deterministic outputs, and semantic validation.

**What if VULMS changes its HTML?**
The SDK validates page structure before parsing. Unexpected pages return `EMPTY_VALID` or `INVALID` rather than crashing. Check snapshots in `debug/navigation/`.

**Is there rate limiting?**
The SDK adds 200-300ms delays between course traversals and handles HTTP 429 responses with backoff.

## Security

**Are my credentials safe?**
Yes. Credentials are passed as function parameters, never logged, never stored to disk.

**What data does telemetry collect?**
Operation success/failure, duration, output fingerprints. No credentials, no tokens, no full HTML.
