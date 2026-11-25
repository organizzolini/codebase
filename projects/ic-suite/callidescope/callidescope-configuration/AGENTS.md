# callidescope-configuration

Configuration loader, entry point resolution, and depth limit definitions for Callidescope. It depends on `@callidescope/core`.

## Modules

- `configuration/` — Loads, validates, and normalizes callidescope configuration files (`ConfigurationFileService`).
- `flag-resolution/` — Combines a command line with the configuration it was resolved against (`FlagResolutionService`).
- `input/` — Parses CLI option values and asks for the ones a command still needs (`InputService`).
- `run-plan/` — Reads a command line and its configuration into what the run will do (`RunPlanService`).
