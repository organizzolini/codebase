# MeanderawWeb: TanStack Start Web Application

## Quick Start

**Type**: Server-rendered web application (TanStack Start)

**Purpose**: A gallery of the meanders `meanderaw-api` serves: each as a card with its drawing, shape, Code and characteristics, in a grid or a list, sorted by any field, paged by cursor and virtualized. Reads the API at `VITE_MEANDERAW_API_URL` (default `http://localhost:8367/graphql`); view and sort live in the URL search params. GraphQL documents are in `src/graphql/operations/`; `nx run meanderaw-web:codegen` regenerates the typed documents from the API's emitted `src/schema.gql`.

### Run Locally

```bash
nx run meanderaw-web:start
```

## Architecture Overview

### Tech Stack

- **Framework**: TanStack Start (server rendering, server functions) on Vite
- **Routing**: TanStack Router, file-based, from `src/routes/`
- **UI**: React 19 with Tailwind CSS 4
- **Testing**: Vitest and React Testing Library under jsdom

### Directory Layout

```text
src/
  client.tsx                     # Client entry, hydrates the document
  router.tsx                     # Creates the router; TanStack Start requires it here
  routeTree.gen.ts               # Generated route tree — never edit
  routes/
    __root.tsx                   # Document shell every route renders inside
    <route>.tsx                  # One file per route, e.g. index.tsx, word.$id.tsx
    <route>.integration.test.tsx # Ignored by the route generator
  components/
    <component>/
      <component>.tsx              # The folder's component and its Properties
      <component>.unit.test.tsx
      <component>.types.ts
      <component>.constants.ts
      <component>.utilities.ts
      <part>.tsx                   # More components the folder's is built from
      <module>.<kind>.ts           # Shared code the folder owns, tested beside it
  hooks/
    use-<hook>/
      use-<hook>.ts                # The folder's hook
      use-<hook>.unit.test.ts
      use-<hook>.types.ts
      use-<hook>.constants.ts
      use-<hook>.utilities.ts
  modules/
    <feature>/                   # Server functions and the utilities behind them
  styles/
    application.css
testing/
  setup.ts                       # Shared test setup
```

## Development

Scaffold with the generators rather than writing these shapes by hand — each one
is also the standard its files are validated against:

```bash
nx g conformetry:tanstack-route --name=<file-stem> --path=<url-path> --project=meanderaw-web
nx g conformetry:tanstack-server-function --name=<feature> --project=meanderaw-web
nx g conformetry:react-component-folder --name=<component> --project=meanderaw-web
nx g conformetry:react-component-file --name=<part> --module=<component> --project=meanderaw-web
nx g conformetry:react-hook-folder --name=use-<hook> --project=meanderaw-web
nx g conformetry:react-hook-file --name=use-<other> --module=use-<hook> --project=meanderaw-web
```

### Routes

A route's name is its file stem — `index`, `search`, `word.$id` — and its route
path is the URL it serves: `/`, `/search`, `/word/$id`. TanStack's route
generator rewrites the path argument to match the file whenever they disagree,
and regenerates `src/routeTree.gen.ts` on every `start` or `build`. Each page
is a `<section>` with an `<h1>`, named after its route — `word.$id` renders
`WordIdPage` — inside the layout the root route renders.

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
pnpm add --filter meanderaw-web zod
```

### Key Commands

```bash
nx run meanderaw-web:start      # Development server
nx run meanderaw-web:build        # Production build into dist/
nx run meanderaw-web:preview      # Serve the production build
nx run meanderaw-web:vitest       # Unit tests
nx run meanderaw-web:typecheck-code,lint-code,format-code,deprecate-code,guard-code
```

### Testing

Route tests call `renderRoute` from `@codebase/testing/react` with the
application's router, which loads the real route tree in a memory history and
renders the page without the root's document shell, so the route's loader,
head, and page all run as a navigation would run them. They are
integration tests for that reason, and the distinct suffix is also what tells a
route's files apart from a component's when conformance is checked.
`vitest.config.ts` deliberately leaves the TanStack Start plugin out, so route
components are not code-split into lazy chunks under test.

See the [write-react skill](/.agents/skills/write-react/SKILL.md) for
component conventions and the
[testing-strategy skill](/.agents/skills/testing-strategy/SKILL.md) for
test tiers.

## The Gallery

- **Data**: GraphQL over `fetch` in `components/meander-gallery/meanders-api.utilities.ts`; typed documents come from `nx run meanderaw-web:codegen`, which reads the API's emitted `src/schema.gql` and the documents in `src/graphql/operations/`.
- **Paging**: hand-rolled in `hooks/use-meanders/use-meanders.ts`, since the repository has no `@tanstack/react-query`.
- **Virtualization**: `@tanstack/react-virtual`'s window virtualizer in `MeanderGallery`.
- **State**: view, sort and repeats live in URL search params, validated with Zod in `use-gallery-search.constants.ts`; a sort the catalog does not know falls back to the default order, and repeats outside 1 to 24 (the API's `MAXIMUM_SVG_REPEATS`) or not a number fall back to 12, and an unknown view to the list. A change to the sort or repeats reloads from page 1.
- **Cards**: each card stacks the drawing (at the SVG's own aspect) over the Code with its repeats written `r<n>`, as the Code format spells them, and pills of its characteristics grouped by catalog category, patterns first.
- **Tests**: route integration tests mock GraphQL with MSW; `testing/meanders-api.ts` serves the fixture and `testing/viewport.ts` fakes width, resize observers and scroll.

## Key Files

- [src/router.tsx](src/router.tsx): Router factory
- [src/routes/\_\_root.tsx](src/routes/__root.tsx): Document shell
- [vite.config.mts](vite.config.mts): TanStack Start, Tailwind, and React plugins
- [vitest.config.ts](vitest.config.ts): Test configuration
