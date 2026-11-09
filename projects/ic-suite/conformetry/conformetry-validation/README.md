# 👔 Conformetry Validation

[![npm](https://img.shields.io/npm/v/@conformetry/validation?logo=npm&label=npm)](https://www.npmjs.com/package/@conformetry/validation)

The validation orchestrator for [Conformetry](../conformetry-cli/README.md):
it matches instances to templates, checks the declared files exist, routes
each document to the validator that claims its extension, and deduplicates
what comes back.

```bash
npm install --save-dev @conformetry/validation
```

## Usage

```ts
import { ValidationService } from "@conformetry/validation";

const result = validationService.validate({
  instances, // from DiscoveryService.findInstances
  templates, // from DiscoveryService.collectTemplate
  languageNames: ["typescript"], // optional filter
  threshold: 0.9, // optional run-level conformance floor
});
// → { ok, fileResults, checkedPaths, scores, unmatched }
```

Instances arrive from the caller. This package used to scan the workspace for
`project.json` files and infer scope from generator name suffixes, which made a
generic package depend on one repository's layout.

## Order of checks

1. **Files exist.** Every file the matched template declares is checked first,
   whatever its extension. A missing file cannot be compared, and reporting it
   once is clearer than every language reporting it in turn. See
   [`@conformetry/languages`](../conformetry-languages/README.md), whose
   `FilesService` owns that pass.
2. **Documents compare.** Each validator sees only the documents whose
   extensions it claims.

Instances that matched no template are reported alongside the content
differences rather than skipped, so one report covers both "this file is wrong"
and "conformetry cannot tell what this path was generated from".

## Scoring

Each matched instance is scored by how much of its template it honours, and
passes when that reaches the threshold resolved for it — the instance group's,
else the generator's, else the run's, else a perfect `1`.

Scores are taken **before** deduplication. Deduplication decides which template
gets to _print_ a shared file's finding, which is a reporting concern; a score
answers how well one instance honours its own template, so collapsing the
report must not change it.

`ok` is `false` when any instance falls below its threshold, or when any
instance matched no template at all — an unmatched path has no template to be
held to, so no threshold could excuse it.

## Language resolution

Which languages a run needs is
[`@conformetry/languages`](../conformetry-languages/README.md)'s question, not
this package's. `LanguagesService` is injected, asked which engines claim the
extensions the run's templates declare, and its answer is what `validate`
dispatches over. An extension no language claims is compared line by line by
the text fallback, so no template file goes unchecked.

Nothing is imported on demand any more. That mechanism bought install-time
optionality nobody was spending — the fallback makes every run need the
package regardless — so the specifier registry, the module loader, and the
`loadLanguageModule` option went with it. The trade-off, and the three
alternatives weighed against it, are recorded in
[ADR 0006](../../../../documentation/adr/0006-hold-every-conformetry-language-in-one-package.md).

## Exports

`ValidationService`, `ValidationDeduplicationService`,
`ValidationFindingsService`, `ValidationScoringService`, `ValidationModule`,
and the `RunValidationArguments`, `RunValidationResult`, and
`InstanceFileResults` types.

## Test

```bash
nx run conformetry-validation:vitest
```

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run conformetry-validation:coinagerie-check:write`.

- **breadth**: Callidescope measure of how many callables one function calls directly, shown in this package's Breadth tables and gated.
- **lenient**: Describes a group with a looser threshold; when groups disagree the strictest wins, so a lenient one cannot relax a bar.
- **stem**: Name portion of an instance, such as aspects, joined to its directory so each module is scored separately.
- **under**: Nests each finding beneath its file when the runner assembles results, so the report groups defects by the file they belong to.
- **unrecorded**: Instance whose match recorded no stand-in placeholder values, leaving nothing for inference to fill, so the run stays ok.

<!-- coinagerie:end -->
