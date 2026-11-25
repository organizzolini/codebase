# codependix-cli

Command-line tool for exporting and validating Nx, NestJS, and file-level dependency graphs and boundaries.

## Commands

- `map` — Map every configured dependency graph and export it. (`src/modules/map/map.command.ts`)
- `path` — Find the shortest connecting path between two nodes in codependix graphs. (`src/modules/path/path.command.ts`)
