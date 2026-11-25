# conformetry-cli

Command-line toolchain for scaffolding code from templates and holding implementations to them.

## Commands

- `generate` — Render a template into a new instance. (`src/modules/generate/generate.command.ts`)
- `instances` — List the generated code the configuration finds, and what explains it. (`src/modules/instances/instances.command.ts`)
- `templates` — Name the templates the configuration declares, or which ones explain a path. (`src/modules/templates/templates.command.ts`)
- `validate` — Measure instances against their templates and report every difference. (`src/modules/validate/validate.command.ts`)
