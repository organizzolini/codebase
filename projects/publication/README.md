Commands that run in CI: `run-affected` (Nx affected runs over a change set
corrected for spelling files and conformetry templates) and
`publishable-packages-gate` (runs the publishable-packages check only when an
ic-suite package is affected). See [AGENTS.md](AGENTS.md).

## Start

```bash
nx run publication:start
```

## Test

```bash
nx run publication:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../projects/configuration/conformetry-templates/nestjs-command-project) conformetry template.
