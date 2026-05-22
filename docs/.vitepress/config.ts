# vulms-sdk docs

site_name: vulms-sdk
theme:
  name: vitepress
  features:
    - search
    - carbon-ads
nav:
  - Getting Started: index.md
  - API:
    - Authentication: api/authentication.md
    - Courses: api/courses.md
    - Assignments: api/assignments.md
    - Quizzes: api/quizzes.md
    - GDBs: api/gdbs.md
    - Lectures: api/lectures.md
    - Activities: api/activities.md
    - Configuration: api/configuration.md
    - Errors: api/errors.md
    - Caching: api/caching.md
  - Guides:
    - Quickstart: guides/quickstart.md
    - Migration: guides/migration.md
    - Performance: guides/performance.md
    - Troubleshooting: guides/troubleshooting.md
  - Architecture: architecture.md
  - FAQ: faq.md
