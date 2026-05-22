# Architecture

## Layer Diagram

```
┌──────────────────────────────────────────────────┐
│                  VulmsSDK (public)                │
├───────────┬──────────┬───────────┬────────────────┤
│  Client   │ Modules  │  Parsers  │     Core       │
├───────────┼──────────┼───────────┼────────────────┤
│ HttpClient│Assignment│ Cheerio   │ SessionManager  │
│ PostBack  │ Quiz     │ HTML      │ RuntimeState    │
│ Retry     │ GDB      │ Extract   │ Cache Layer     │
│ Trace     │ Lecture  │ Normalize │ TelemetryStore  │
│           │ Course   │           │ Logger          │
│           │ Activity │           │ OutputNormalizer│
├───────────┴──────────┴───────────┴────────────────┤
│              Utilities (shared)                    │
│  Validation │ Dedupe │ Confidence │ Date │ Nav     │
└──────────────────────────────────────────────────┘
```

## Data Flow

```
1. Login
   └─► Playwright opens browser
   └─► Fills credentials on VULMS login page
   └─► Extracts cookies from browser
   └─► Sets cookies in HttpClient
   └─► GET /Home.aspx
   └─► Caches dashboard HTML + indicators

2. Module traversal
   └─► Check dashboard indicators for course
   └─► POST /Home.aspx with __EVENTTARGET
   └─► Follow 302 redirect
   └─► Parse HTML with Cheerio
   └─► Cache result (5-min TTL)
   └─► Return parsed data

3. Cache reuse
   └─► Check cache entry + TTL
   └─► Return deep copy if valid
   └─► Fetch fresh if expired
```

## Cache Flow

```
getAssignments()
   │
   ├── Cache hit? ──► Return deep copy (0 network)
   │
   └── Cache miss?
        │
        ├── Dashboard cached?
        │   ├── Yes ──► Reuse dashboard HTML
        │   └── No  ──► Fetch Home.aspx
        │
        ├── Dashboard indicators show
        │   assignments for this course?
        │   ├── Yes ──► Navigate + parse
        │   └── No  ──► Return [] (skip traversal)
        │
        └── Store in cache ──► Return result
```
