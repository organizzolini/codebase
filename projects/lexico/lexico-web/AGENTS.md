# Lexico: Latin Dictionary Web Application

## Quick Start

**Type**: SSR web app (TanStack Start)

**Purpose**: Latin word lookup, searching Latin and English at once

### Run Locally

```bash
nx run lexico-web:develop
```

## Architecture Overview

### Tech Stack

- **Frontend**: React 19, TanStack Router (file-based routing)
- **SSR**: TanStack Start server functions
- **Styling**: Tailwind CSS, shadcn/ui via [@codebase/components-web](../../components-web)

### File-Based Routes

```text
routes/
├── __root.tsx              # Root layout (HTML shell, sidebar)
├── index.tsx               # / (redirects to /search)
└── search.tsx              # /search
```

Generated route tree: [src/routes/routeTree.gen.ts](src/routes/routeTree.gen.ts) (auto-generated, never edit; its path is set by `router.generatedRouteTree` in `vite.config.mts`, resolved relative to `srcDirectory`)

### Data

`/search` defines its server function in the route file and calls it from the route loader. The function runs the API's `searchLatin` and `searchEnglish` queries together and merges them. There is no `src/lib/`: code lives in the route, in `src/components/`, or in a generated module.

See the [write-react skill](../../../.agents/skills/write-react/SKILL.md) for route, loader, and server function patterns, and the conformetry generators that scaffold them.

## Component Library Integration

Always import shared UI from `@codebase/components-web` and never duplicate UI code.

```tsx
import { Button, Card, Input } from "@codebase/components-web";
```

See the [write-react skill](../../../.agents/skills/write-react/SKILL.md) and [components-web AGENTS](../../components-web/AGENTS.md).

## Testing

See the [testing-strategy skill](../../../.agents/skills/testing-strategy/SKILL.md) for unit/integration/end-to-end patterns.

## Troubleshooting

See the [triage-integration skill](../../../.agents/skills/triage-integration/SKILL.md) for lint and git hook failures.

## Key Files

- [src/routes/](src/routes/): File-based routes
- [src/components/](src/components/): One component and its test per file
