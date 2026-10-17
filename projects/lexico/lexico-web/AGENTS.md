# Lexico - Latin Dictionary & Reader

## Quick Start

**Type**: Server-rendered web application (TanStack Start)

**Purpose**: Latin word lookup, searching Latin and English at once

### Run Locally

```bash
nx run lexico-web:start
```

## Architecture Overview

### Tech Stack

- **Framework**: TanStack Start (server rendering, server functions) on Vite
- **Routing**: TanStack Router, file-based, from `src/routes/`
- **UI**: React 19 with Tailwind CSS 4
- **Testing**: Vitest and React Testing Library under jsdom
- **Components**: shadcn/ui, from [@codebase/components](../../components)

### Directory Layout

```text
src/
  client.tsx                     # Client entry, hydrates the document
  router.tsx                     # Creates the router; TanStack Start requires it here
  lib/
    routeTree.gen.ts             # Generated route tree — never edit
  routes/
    __root.tsx                   # Document shell every route renders inside
    <route>.tsx                  # One file per route, e.g. index.tsx, word.$id.tsx
    <route>.integration.test.tsx # Ignored by the route generator
  components/
    <component>.tsx
    <component>.unit.test.tsx
  hooks/
    use-<hook>.ts
    use-<hook>.unit.test.ts
  modules/
    <feature>/                   # Server functions and the utilities behind them
  styles/
    application.css
testing/
  render-route.tsx               # Renders a route through a real router
  setup.ts                       # Shared test setup
```

### Data

`/search` defines its server function in the route file and calls it from the
route loader. The function runs the API's `searchLatin` and `searchEnglish`
queries together and merges them. There is no `src/modules/` or `src/hooks/`
here: code lives in the route, in `src/components/`, or in a generated module.

### Component Library Integration

Always import shared UI from `@codebase/components` and never duplicate UI code.

```tsx
import { Button, Card, Input } from "@codebase/components";
```

The root route lays every page out in the shared sidebar, and
`src/styles/application.css` layers this application's accent color over the
shadcn tokens that `@codebase/components` ships. See the
[write-react skill](/.agents/skills/write-react/SKILL.md) and
[components AGENTS](../../components/AGENTS.md).

## Development

Scaffold with the generators rather than writing these shapes by hand — each one
is also the standard its files are validated against:

```bash
nx g conformetry:tanstack-route --name=<file-stem> --path=<url-path> --project=lexico-web
nx g conformetry:tanstack-server-function --name=<feature> --project=lexico-web
nx g conformetry:react-component --name=<component> --project=lexico-web
nx g conformetry:react-hook --name=use-<hook> --project=lexico-web
```

### Routes

A route's name is its file stem — `index`, `search`, `word.$id` — and its route
path is the URL it serves: `/`, `/search`, `/word/$id`. TanStack's route
generator rewrites the path argument to match the file whenever they disagree,
and regenerates `src/lib/routeTree.gen.ts` on every `start` or `build`. A new
application has no route tree until one of them has run, so run `build` once
after generating it and commit the file. Each page is a `<section>` with an
`<h1>`, named after its route — `word.$id` renders `WordIdPage` — inside the
layout the root route renders.

Keep a route file to its `Route` and the page it renders. Reusable pieces belong
in `src/components/`, stateful logic in `src/hooks/`, and anything that runs on
the server in `src/modules/`.

### Loaders and Actions

TanStack Start has no separate loader or action files. Data is read by a GET
server function called from the route's `loader`, then read in the page with
`Route.useLoaderData()`. Data is written by a POST server function called from a
component through `useServerFn`, followed by `router.invalidate()` so every
loader on the page runs again.

A generated server function module keeps that logic in `<feature>.utilities.ts`,
outside `createServerFn`, so it is unit tested without the Start runtime. Add
`zod` to this project's dependencies before generating the first one:

```bash
pnpm add --filter lexico-web zod
```

### Key Commands

```bash
nx run lexico-web:start      # Development server
nx run lexico-web:build        # Production build into dist/
nx run lexico-web:preview      # Serve the production build
nx run lexico-web:vitest       # Unit tests
nx run lexico-web:typecheck-code,lint-code,format-code,deprecate-code,guard-code
```

### Testing

Route tests call `renderRoute` from `testing/render-route.tsx`, which loads
the real route tree in a memory-history router under a bare root, so the
route's loader, head, and page all run as a navigation would run them. They are
integration tests for that reason, and the distinct suffix is also what tells a
route's files apart from a component's when conformance is checked.
`vitest.config.ts` deliberately leaves the TanStack Start plugin out, so route
components are not code-split into lazy chunks under test.

See the [write-react skill](/.agents/skills/write-react/SKILL.md) for
component conventions and the
[testing-strategy skill](/.agents/skills/testing-strategy/SKILL.md) for
test tiers.

## Troubleshooting

See the [triage-integration skill](/.agents/skills/triage-integration/SKILL.md)
for lint and git hook failures.

## Key Files

- [src/router.tsx](src/router.tsx): Router factory
- [src/routes/\_\_root.tsx](src/routes/__root.tsx): Document shell
- [vite.config.mts](vite.config.mts): TanStack Start, Tailwind, and React plugins
- [vitest.config.ts](vitest.config.ts): Test configuration
- [src/routes/](src/routes/): File-based routes
- [src/components/](src/components/): One component and its test per file
