# callidescope-cli

Traces call stacks through injected dependencies and flags the ones that are too deep, reading the limits it enforces from `callidescope.config.ts` via `@callidescope/configuration`. ### Run Locally

## Commands

- `breadth` — Print the direct callers and callees of one or more callables, each addressed as `<file>#<qualified-name>`. (`src/modules/breadth/breadth.command.ts`)
- `callidescope` — The default command: traces call stacks and gates their depth and breadth, so `callidescope --check depth` runs without naming it. (`src/modules/callidescope/callidescope.command.ts`)
- `depth` — Print every call stack above and below one or more callables, each addressed as `<file>#<qualified-name>`. (`src/modules/depth/depth.command.ts`)
- `limits` — List every project's resolved depth and breadth limits, and the file each came from. (`src/modules/limits/limits.command.ts`)
