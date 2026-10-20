# Lexico Components: Shared React Component Library

## Quick Start

**Type**: Shared UI component library (shadcn/ui `base-nova` + Base UI + ReUI)

**Purpose**: Single source of UI primitives and shared components for the codebase

### Add a shadcn Component

```bash
cd projects/common/presentation
pnpx shadcn@latest add <component-name>
```

Then export it in [src/index.ts](src/index.ts).

ReUI components come from the `@reui` registry declared in
[components.json](components.json): `pnpx shadcn@latest add @reui/<name>`. They
land in `src/components/reui/`. The style is `base-nova`, so everything is Base UI:
render a different element with the `render` property (and `nativeButton={false}` when
a button renders as a link), never Radix's `asChild`. reui.io rate-limits (HTTP
429), so add them a few at a time.

**Anything that depends on shadcn's `calendar`** (`date-selector`, `event-calendar`,
`gantt`…) fails with `ERR_PNPM_CATALOG_VERSION_MISMATCH`: that item asks for
`react-day-picker@latest`, and the workspace's `catalogMode: strict` rejects an
explicit specifier for a catalog package. Install it with the mode relaxed for that
one command, then undo what it rewrote:

```bash
pnpm_config_catalog_mode=prefer pnpm dlx shadcn@latest add @reui/<name> --overwrite --yes
```

Afterwards restore the `react-day-picker` entry in `pnpm-workspace.yaml`
(`^10.0.1`, deleted by the run), put `"react-day-picker": "catalog:"` back in
`package.json` (it writes a literal version), and run `pnpm install`. Check
`git diff pnpm-workspace.yaml package.json` for any other catalog package it rewrote
the same way (`recharts` was pinned to the registry's `3.8.0`).

After every `shadcn add`, re-apply the typecheck exclusion — the CLI strips the
header from each file it rewrites:

```bash
for f in $(find src/components src/hooks src/lib -name '*.ts' -o -name '*.tsx'); do
  head -1 "$f" | grep -q '@ts-nocheck' || { printf '// @ts-nocheck\n' | cat - "$f" > "$f.tmp" && mv "$f.tmp" "$f"; }
done
```

## Choosing Components with ReUI

Two MCP servers are declared in the root [.mcp.json](../../.mcp.json): `shadcn`
(browse and install from `components.json`, pinned to this project with `--cwd`) and
`reui` (`https://mcp.reui.io`, ranked search and real component APIs). Sign in once with
`/mcp` → `reui` → "Sign in with ReUI"; the free account has a daily request allowance
that resets at UTC midnight (an exhausted allowance still answers, with a notice).

The rules live in the vendored [reui skill](../../.agents/skills/reui/SKILL.md), which
loads for any UI work here: the plan-first loop (find, install, read the API, adapt,
check), which component owns which job (`data-grid`, `filters`, `kanban`, `Dialog`),
color, spacing, and motion rules, and the `weakMatch` and `locked` handling. Read it
instead of guessing, and call the MCP's `get_agent_skill` if the folder is missing.

This project is `base-nova`, so use only the `/base/` variant of a ReUI item.
`@reui/<name>` is a registry namespace installed through the shadcn CLI, never
`pnpm add @reui/…`.

The skill comes from `https://mcp.reui.io/api/skills/download` and is recorded in
`skills-lock.json` as `local`, so `skills update` skips it. The weekly
`upgrade-dependencies` workflow refreshes it with the `installation` project's
`update-reui-skill` command; run `pnpm exec nx run installation:start:update-reui-skill`
to refresh it sooner. Never edit the folder by hand.

## Architecture Overview

### Component Ownership Model

- **`src/components/ui/`**: **Never modify** (shadcn-generated)
- **`src/components/reui/`**: **Never modify** (ReUI-generated)
- **`src/components/examples/`**: **Never modify** (ReUI demo blocks)
- **`src/hooks/`**, **`src/lib/`**: Vendored with the components (`cn()`, ReUI hooks)

**Rule**: `src/components`, `src/hooks`, `src/lib`, and `src/styles/globals.css` are
vendored. Every check skips them: typecheck through the `// @ts-nocheck` header, and
type-coverage, ESLint, oxlint, oxfmt, prettier, stylelint, knip, codometer,
callidescope, dependency-cruiser, and spell-check through their ignore lists. Keep
them identical to upstream; compose them from code outside those directories.

### Theming Strategy

- Tailwind CSS + CSS variables
- Light/dark mode via `data-theme`
- Tokens in [src/styles/globals.css](src/styles/globals.css)

See the [write-react skill](../../.agents/skills/write-react/SKILL.md) for theming patterns.

## Usage in Apps

```tsx
import { Button, Card, Input } from "@codebase/presentation";
```

Never duplicate UI code in apps. Always import from this package.

## Development

### Add Custom Components

```bash
cd projects/common/presentation/src/components
touch word-card.tsx
```

### Export Components

```ts
// src/index.ts
export * from "./components/word-card";
```

## Troubleshooting

- **shadcn updates overwriting `ui/` files** — never edit `src/components/ui/` directly; compose those primitives in `src/components/` instead, so `pnpx shadcn@latest add <component>` stays safe to re-run.
- **Theme tokens not updating** — CSS variables in [src/styles/globals.css](src/styles/globals.css) must be bare HSL values (`--primary: 0 0% 9%`), not `hsl(...)` wrapped. Clear `node_modules/.vite` and restart the dev server after changing them.

## Key Files

- [src/components/ui/](src/components/ui/): shadcn-generated components
- [src/components/](src/components/): custom components
- [src/hooks/](src/hooks/): shared hooks
- [src/lib/utils.ts](src/lib/utils.ts): `cn()` utility
- [src/styles/globals.css](src/styles/globals.css): theme tokens
- [components.json](components.json): shadcn configuration
