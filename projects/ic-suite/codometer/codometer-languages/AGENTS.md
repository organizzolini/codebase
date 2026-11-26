# codometer-languages

Language parsers and comment analyzers across TypeScript, JSON, Markdown, Python, and SQL for Codometer. It depends on `@codometer/configuration`, `@codometer/core`.

## Modules

- `comments/` — NestJS module that provides comment-length measurement (`CommentsModule`).
- `languages/` — Runs every language analyzer over the discovered files (`LanguagesService`).
