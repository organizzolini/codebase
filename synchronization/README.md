# ↔️ Synchronization

**Emptied: awaiting removal.**

Every check and derivation this project once ran now runs from
[integration](../integration), each as its own Nx target there, for example
`nx run integration:skill-exclusions:write`. `nx run integration:start` runs the
registered ones together. Nothing here is called any more.

## Start

```bash
nx run synchronization:start
```

## Test

```bash
nx run synchronization:vitest
```

## Development

```bash
nx run synchronization:repl
nx run synchronization:typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write
```

## License

MIT — see [LICENSE](../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../configuration/conformetry-templates/nestjs-command-project) conformetry template.
