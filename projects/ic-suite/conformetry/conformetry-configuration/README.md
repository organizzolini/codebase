# 👔 Conformetry Configuration

[![npm](https://img.shields.io/npm/v/@conformetry/configuration?logo=npm&label=npm)](https://www.npmjs.com/package/@conformetry/configuration)

**The configuration reference for [Conformetry](../conformetry-cli/README.md).**

`@conformetry/configuration` reads a repository's `conformetry.config.*`, checks
it, and turns it into the three things the rest of the toolchain works from:
the generator registry, the instances validation walks, and the
resolved inputs a generator renders with.

```bash
npm install --save-dev @conformetry/configuration
```

Most consumers never install this directly — `@conformetry/cli` and
`@conformetry/nx` both depend on it. Install it when you are typing a
configuration file, or embedding conformetry in a host of your own.

## The configuration file

The file's extension may be any of `.ts`, `.mts`, `.cts`, `.js`, `.mjs`, `.cjs`,
`.json`, or `.jsonc`. The path is always passed in explicitly — no filename is
searched for. TypeScript and
JavaScript files are loaded through [jiti](https://github.com/unjs/jiti), so a
`.ts` config needs no build step and may import from your workspace.

The path is resolved against the current directory first, then against the
workspace root — located by walking upward for `pnpm-workspace.yaml` — so a
config path written relative to the root still resolves from a nested
directory.

The file default-exports an **array of generator definitions**. It is an array
rather than a keyed record because a generator's name is already a field, and a
record made the name true in two places at once.

```ts
import { type ConformetryConfiguration } from "@conformetry/configuration";

const conformetryConfiguration: ConformetryConfiguration = [
  {
    description: "Generate a NestJS service module",
    inputs: {
      name: { description: "Module name in kebab-case", type: "string" },
    },
    instances: [{ patterns: ["packages/*/src/modules/*"] }],
    name: "nestjs-service-module",
    templatePath: "templates/nestjs-service-module",
  },
];

export default conformetryConfiguration;
```

### Generator fields

| Field | Required | Purpose |
| ----- | -------- | ------- |
| `name` | ✅ | How the generator is addressed, and the filename it is emitted under |
| `templatePath` | ✅ | The template folder, relative to the workspace root |
| `inputs` | | The values it substitutes, as JSON Schema fragments |
| `instances` | | Where this generator's output already lives |
| `description` | | Shown when a host lists or prompts for generators |
| `hooks` | | `preGenerate` and `postGenerate` functions run around the render; see [`@conformetry/generation`](../conformetry-generation/README.md) |

Both `inputs` and `instances` may be omitted. A generator with neither renders
a fixed template nobody validates, which is legal.

### What is rejected

The schema fails loudly rather than validating nothing, and reports every
problem in one pass:

- **Two generators answering to the same name.** A host resolves the first
  match, so a collision does not error where it is used — it silently shadows,
  and the losing generator becomes unreachable while still appearing in the
  configuration.
- **Two generators sharing a `templatePath`.** Validation then finds instances
  that fit both equally and reports them as matching nothing.
- **A name containing a path separator.** A generator is addressed by its name
  and emitted to a file named after it.
- **A key the schema does not declare.** The generator object is strict, so a
  misspelled field — or `aliases`, which was removed outright — is rejected
  rather than stripped and left reading as though it took effect.
- **A hook that is not a function, or an unknown key under `hooks`.** A
  string or object where a function was meant is named by its hook, and
  `hooks` is strict for the same reason the generator is: a misspelt hook name
  would otherwise be stripped and the hook silently never run.

## Instances

`instances` is what makes validation possible. It says where a generator's
output already lives, so validation knows what to check without being told a
second time.

```ts
instances: [
  { patterns: ["packages/*/src/modules/*"] },
  {
    patterns: ["applications/*/src/modules/*"],
    substitutions: { type: "applications" },
  },
];
```

| Field | Purpose |
| ----- | ------- |
| `exclude` | Workspace-relative globs naming paths that are never instances, applied with or without `tags` |
| `patterns` | Globs locating this group's instances, workspace-relative |
| `substitutions` | Values the template's placeholders are rendered with for this group |
| `tags` | Labels selecting which hosts the group applies to, carried uninterpreted |
| `threshold` | Lowest conformance score these instances may have, overriding the generator's |

Groups exist so substitutions can differ per glob. `type` is `packages` for one
set of paths and `applications` for another, and no generic rule can tell them
apart.

> **A placeholder these substitutions leave out is read from the instance.**
> Validation renders a random stand-in for it, captures the text the instance
> holds where the template's first use of it aligns, renders the template again
> with that text, and compares as usual — so a later use holding different text
> is an ordinary difference. When nothing aligns, the instance fails with
> `Could not infer {{…}}`. `name` and its variants always come from the
> instance path, and a value supplied here always wins. Generation has no
> instance to read, so there a placeholder nobody supplied still raises
> `MissingSubstitutionError` — see
> [`@conformetry/generation`](../conformetry-generation/README.md) for why, and
> for the section syntax a template uses to make a placeholder optional.

`exclude` drops any instance whose own path — the directory a pattern found, or
the files of a file instance — matches one of its globs, whether or not the
group has `tags`. It is how vendored or generated code living beside real
instances, such as shadcn's component output, is left out of validation:
`exclude: ["projects/lexico/lexico-web/src/components/ui/**"]`.

`tags` is carried through untouched by this package, which has no notion of a
host to match labels against. [`@conformetry/nx`](../conformetry-nx/README.md)
reads them as Nx project tags and resolves each group's globs _inside_ every
matching project; another host is free to read them as something else. A group
naming only `tags` is legal — it selects without locating, which is what a
template with no instances yet wants.

### Directory globs versus file globs

The two behave differently on purpose, and the difference is what lets a
small template win against a large one.

- A **directory glob** leaves the match scope open, and the largest fitting
  template wins.
- A **file glob** narrows the scope to the matched files, so a template
  describing exactly those files fits better than one describing the whole
  directory.

That is how a two-file template such as `nestjs-service-file` is matchable at
all inside a directory a five-file module template also claims:

```ts
instances: [
  { patterns: ["src/modules/*/*.service.ts", "src/modules/*/*.service.unit.test.ts"] },
];
```

### Where a template is laid down

A template that produces a _folder_ contains that folder, so its instance path
is the folder's **parent**: `nestjs-service-module` holds `{{nameKebabCase}}/…`,
and its instances are `…/src/modules`. A template that produces loose files
holds them at its root, and its instance path is the directory those files sit
in.

## Thresholds

An instance passes when its conformance score reaches the threshold that
applies to it. Three levels set it, and the narrowest wins:

```ts
instances[].threshold ?? generator.threshold ?? runThreshold ?? 1
```

A level left unset stays unset rather than being filled with the default — that
is what lets a host's own `--threshold` reach an instance whose generator has
no opinion. The default of `1` is applied only at the end of the chain, so
nothing configured is quietly overridden, and a level nobody set is not
quietly treated as if they had.

```ts
{
  name: "nestjs-service-module",
  templatePath: "templates/nestjs-service-module",
  threshold: 1,                               // strict everywhere by default
  instances: [
    { patterns: ["packages/*/src/modules/*"] },
    {
      patterns: ["applications/legacy/src/modules/*"],
      threshold: 0.75,                        // …except while migrating this one
    },
  ],
}
```

When two groups locate the same instance with different thresholds the
strictest wins: nothing makes one group more specific than another, and letting
order decide would mean a lenient group could silently relax a bar someone else
set.

## Inputs

Each entry in `inputs` is a JSON Schema fragment. Only `properties` and
`required` are read — enough to know an input's name, whether it must be
supplied, and what to say when prompting for it.

Authoring them by hand is verbose, so deriving them from a schema library is
the usual approach:

```ts
import { z } from "zod";

function defineInputs(shape: z.ZodRawShape) {
  return z.toJSONSchema(z.object(shape)).properties ?? {};
}

inputs: defineInputs({
  name: z.string().describe("Module name in kebab-case"),
  project: z.string().describe("Parent project name in kebab-case"),
});
```

Values are resolved in order: flags passed on the command line first, then
interactive prompts for anything still missing. Prompting is skipped entirely
when stdin is not a TTY or `CI` is `true`, so a missing input fails the command
rather than hanging it.

## Matching

Validation does not record which template produced a file. It works it out:
every instance is weighed against every template by the share of the template's
files the instance already has, and the best fit wins.

Two outcomes are reported rather than skipped, because a glob is the author
asserting that these paths _are_ instances:

| Reason | Meaning |
| ------ | ------- |
| `no-match` | No template explains this instance well enough |
| `ambiguous` | Two or more templates tied, so they are indistinguishable here |

## Exports

| Export | Purpose |
| ------ | ------- |
| `ConfigurationService` | Everything this layer answers: loading a configuration file, reading templates, expanding globs into instances, matching the two, rendering placeholders, and resolving generator inputs |
| `ConfigurationModule` | The NestJS module that provides it |
| `ConfigurationPathRequiredError` | Thrown by `ConfigurationService.requireConfigurationPath` for an absent or blank path, naming the flag or option the caller passed as the surface |
| `ConformetryConfiguration` | The loaded configuration type — author your config as this |
| `ConformetryInstanceGroup`, `ConformetryGeneratorDefinition` | Field-level types for the above |
| `GeneratorHook`, `GeneratorHookContext`, `GeneratorHooks` | The hook types, re-exported from `@conformetry/core` so a config file can type its hooks from this package |

**One service and one module, and no other collaborator** — the same pair
`@callidescope/configuration`, `@codependix/configuration` and
`@codometer/configuration` publish, so learning one of the four teaches you all
of them.

Behind the facade, template discovery, instance discovery, rendering, instance
groups, and input resolution stay six separate classes in six separate files,
because they are six different jobs. What they are not is six entry points a
host has to know the names of: a consumer imports `ConfigurationModule` and
injects `ConfigurationService`.

Whether a configuration path is required, and what the refusal says, is
decided here and nowhere else: `ConfigurationService.requireConfigurationPath(path, surface)`
returns the trimmed path or throws `ConfigurationPathRequiredError`. The CLI
passes `the --config flag`, and the Nx plugin passes its own option names;
neither keeps a guard or a message of its own.

Loading a configuration file is the one job `ConfigurationService` holds
itself; everything that touches paths is a one-line hand-off to the
collaborator that owns it.

## Test

```bash
nx run conformetry-configuration:vitest
```

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.
