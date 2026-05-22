# vulms-sdk

TypeScript SDK for Virtual University LMS (VULMS).

## Install

```bash
npm install vulms-sdk
```

## Quick Start

```typescript
import { VulmsSDK } from '@vulms/sdk';

const sdk = new VulmsSDK();
const result = await sdk.loginWithBrowser('BC000000000', 'password');
if (!result.success) throw new Error(result.error);

const courses = await sdk.courses.getEnrolledCourses();
const assignments = await sdk.assignments.getAssignments();
const agg = await sdk.activities.getAll();

console.log(`${agg.pending.length} pending, ${agg.missed.length} missed`);
```

## Features

- **Single login** — shared runtime state, one login per SDK lifecycle
- **Smart caching** — dashboard HTML cached, output cache with 5-min TTL
- **Request reduction** — dashboard indicators skip empty modules
- **Semantic validation** — distinguishes empty pages from broken pages
- **Deterministic outputs** — sorted arrays, stable fingerprints
- **Telemetry** — built-in benchmarking and release gate validation

## API

- [Authentication](api/authentication.md)
- [Courses](api/courses.md)
- [Assignments](api/assignments.md)
- [Quizzes](api/quizzes.md)
- [GDBs](api/gdbs.md)
- [Lectures](api/lectures.md)
- [Activities](api/activities.md)
- [Configuration](api/configuration.md)
- [Errors](api/errors.md)
- [Caching](api/caching.md)
