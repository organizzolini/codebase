# 👔 Conformetry Output

[![npm](https://img.shields.io/npm/v/@conformetry/output?logo=npm&label=npm)](https://www.npmjs.com/package/@conformetry/output)

Every render target [Conformetry](../conformetry-cli/README.md) has. It sits at
the output layer of the five-layer spine — `core <- configuration <- analysis
<- output <- cli` — so it reads what analysis produced and turns it into text,
and runs no analysis of its own.

```bash
npm install --save-dev @conformetry/output
```

## What it owns

| Module | Responsibility |
| ------ | -------------- |
| `reporting` | Renders structured conformance differences, and the per-instance score summary above them, as readable and actionable text |
| `inventory` | Renders the template and instance inventory: the indent ladder, the headings, and the match percentage |

Both are rendering, and both used to live in
[`@conformetry/core`](../conformetry-core/README.md) — which is why that package
could not be a contracts leaf. They are here so that "the host composes, the
output renders" is true of conformetry the way it is of its three siblings, and
so that adding a render format has exactly one home.

## Where a host gets them

`ReportingModule` and `InventoryModule` are named explicitly by whichever host
wants them. Neither is re-exported by `ValidationModule`: validation is an
analysis package and sits _beneath_ this one, so it cannot reach up to hand a
renderer on.

```ts
@Module({ imports: [ReportingModule, ValidationModule] })
class EmbeddedConformetryModule {}
```

## Paths

Paths arrive absolute, because that is the only stable way for discovery to
name an instance to another process. Shortening them against a working
directory is offered as a separate step rather than folded into rendering —
only a host knows which directory a person is standing in.

## Test

```bash
nx run conformetry-output:vitest
```

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run conformetry-output:coinagerie-check:write`.

- **breadth**: Callidescope measure of how many callables one function calls directly, shown in the README breadth tables and gated per project.
- **inventoried**: Types for entries the inventory service has listed: InventoriedInstance, InventoriedTemplate, and InventoriedPairing.
- **inventory**: Module that renders the template and instance listing, with its indent ladder, headings, and match percentage.
- **meet**: Verdict wording used when an instance's score reaches its threshold, paired with below threshold for failing instances.
- **perfect**: Score of exactly full weight; reporting leaves perfect instances out of the summary of scores that fell short.

<!-- coinagerie:end -->
