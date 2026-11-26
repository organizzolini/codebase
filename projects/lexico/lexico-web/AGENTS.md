# lexico-web

Latin word lookup, searching Latin and English at once, over the `lexico-api` GraphQL API.

## Data

`/search` defines its server function in the route file and calls it from the route loader. The function runs the API's `searchLatin` and `searchEnglish` queries together and merges them. There is no `src/modules/` or `src/hooks/` here: code lives in the route, in `src/components/`, or in a generated module.

## Layout

The root route lays every page out in the shared sidebar, and `src/styles/application.css` layers this application's accent color over the shadcn tokens that `@codebase/presentation` ships. Import shared UI from `@codebase/presentation` rather than duplicating it; see its AGENTS.md for what it holds.
