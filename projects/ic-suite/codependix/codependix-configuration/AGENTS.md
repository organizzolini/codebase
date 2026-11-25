# codependix-configuration

Configuration reader, glob resolution, and boundary constraint definitions for Codependix. It depends on `@codependix/core`.

## Modules

- `configuration/` — Reads and parses codependix configuration files from disk (`ConfigurationLoaderService`).
- `input/` — Parses CLI option values and asks for the ones a command still needs (`InputService`).
- `override-resolution/` — Applies strict, per-field CLI overrides to a resolved configuration (`OverrideResolutionService`).
