Commands that run in CI:
`publishable-packages-gate` (runs the publishable-packages check only when an
ic-suite package is affected) and the release steps `version-packages`, `tag-codebase`, `tag-packages`,
`publish-packages`, and `link-packages`. See
[AGENTS.md](AGENTS.md).

## Start

```bash
nx run deployment:start
```

## Test

```bash
nx run deployment:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../configuration/conformetry-templates/nestjs-command-project) conformetry template.
