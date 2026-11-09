# 👔 Conformetry Core

[![npm](https://img.shields.io/npm/v/@conformetry/core?logo=npm&label=npm)](https://www.npmjs.com/package/@conformetry/core)

The shared contract every other [Conformetry](../conformetry-cli/README.md)
package builds on. It is the contracts leaf of the five-layer spine — `core <-
configuration <- analysis <- output <- cli` — so it declares types and holds
nothing executable: no service, no NestJS module, no dependency on anything
else in the conformetry graph. Importing a result type from here therefore
drags nothing behind it.

```bash
npm install --save-dev @conformetry/core
```

## What it owns

| File | Responsibility |
| ---- | -------------- |
| `lib/differences.types.ts` | The structured `ConformetryDifference` shape, and the language and category unions that discriminate it |
| `lib/inventory.types.ts` | What discovery found, as the output layer renders it: templates, instances, and the pairings between them |
| `lib/runner.types.ts` | The `ConformetryLanguageValidator` contract and the document, payload, and result shapes it is spoken in |
| `lib/scoring.types.ts` | `InstanceScore`: how well one matched instance honours the template it matched |

The behavior these types describe lives above them. The difference and scoring
primitives, the file-existence pass, and every per-format validator are in
[`@conformetry/languages`](../conformetry-languages/README.md); the validator
envelope is in [`@conformetry/validation`](../conformetry-validation/README.md);
rendering is in [`@conformetry/output`](../conformetry-output/README.md).

"Language" here means a validator for one file format — TypeScript, JSON,
markdown, Python. The word "plugin" is reserved for the Nx plugin in
[`@conformetry/nx`](../conformetry-nx/README.md), and is deliberately not used
for these.

## Writing a language validator

A validator supplies a descriptor and a single-document comparison. Extension
filtering, grouping differences under their file, and assembling the result are
handled once by `RunnerService` in `@conformetry/validation`, so a language
package contains only its comparison logic:

```ts
@Injectable()
export class ExampleValidatorService implements ConformetryLanguageValidator {
  public readonly descriptor = EXAMPLE_VALIDATOR_DESCRIPTOR;

  public validateDocument(
    document: PreparedValidationDocument,
  ): DocumentValidationResult {
    // compare document.renderedTemplate against document.instance
    return { differences, totalWeight };
  }
}
```

## Weight and score

A validator reports how much the template asked for alongside what it found.
`totalWeight` counts every requirement the comparison weighed — conforming ones
included, because leaving them out would score an instance only against the
parts of itself that are already wrong.

Each difference may carry a `weight`, defaulting to 1. It says how many
requirements that one finding stands in for: a validator reports a missing
class once, however many members it held, so weighing the finding by its
subtree is what keeps deleting a class from costing the same as deleting an
import. No per-kind weight table is needed — a class is worth more because it
contains more.

```text
score = (totalWeight - sum(difference.weight ?? 1)) / totalWeight
```

`ScoringService`, in `@conformetry/languages`, owns that arithmetic, including
the two cases worth getting right once: the default weight of a finding that
declares none, and an empty template whose denominator is zero and which
therefore conforms perfectly.

[`@conformetry/validation`](../conformetry-validation/README.md) drives the
registered validators; they are never responsible for discovering files or
loading configuration.

## Structured differences

Differences carry the location on both sides — instance and template — along
with the expected value and a concrete `fix`. That last field is the point:
reports are meant to be actionable by whoever, or whatever, has to make the
file conform. Prefer populating `instanceLine`/`templateLine` (or
`instancePath` for document formats) over folding a location into the message.

## Exports

Types only: `ConformetryDifference`, `ConformetryDifferenceLanguage`,
`ConformetryDifferenceType`, `ConformetryLanguageValidator`, `DirectoryEntry`,
`DocumentValidationResult`, `FileSystemAdapter`, `GeneratorDefinition`,
`GeneratorHook`, `GeneratorHookContext`, `GeneratorHooks`, `InstanceScore`,
`InventoriedInstance`, `InventoriedPairing`, `InventoriedTemplate`,
`LanguageValidatorDescriptor`, `LanguageValidatorResult`,
`PreparedValidationDocument`, `PreparedValidationPayload`, and
`ValidationFileResult`.

## Test

```bash
nx run conformetry-core:vitest
```

One test, and it asserts the property that makes this package a leaf: the
module contributes nothing at runtime, so importing a result type from here
cannot drag a service or a NestJS module behind it. Exporting one value fails
it.

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run conformetry-core:coinagerie-check:write`.

- **breadth**: The number of distinct callees one callable calls directly, which callidescope gates in each project; core reports none, since it only declares types.
- **inventoried**: Discovered and paired as an instance or template, such as the InventoriedInstance and InventoriedPairing types carry them.

<!-- coinagerie:end -->
