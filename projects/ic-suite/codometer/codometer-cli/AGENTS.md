# codometer-cli

Command-line tool for measuring repository size, counts, and comments against configured limits.

## Commands

- `changes` — Report codometer's changes against a baseline. (`src/modules/changes/changes.command.ts`)
- `configuration` — List the codometer configuration found beneath a directory. (`src/modules/configuration/configuration.command.ts`)
- `measure` — Measure the working directory, or each directory named, and produce every resolved output. (`src/modules/measure/measure.command.ts`)
