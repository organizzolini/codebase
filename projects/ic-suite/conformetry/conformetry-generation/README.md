# 👔 Conformetry Generation

[![npm](https://img.shields.io/npm/v/@conformetry/generation?logo=npm&label=npm)](https://www.npmjs.com/package/@conformetry/generation)

The generation runtime for [Conformetry](../conformetry-cli/README.md): it
walks a template tree, renders every path and every file, and writes the
result.

```bash
npm install --save-dev @conformetry/generation
```

## Usage

```ts
import { GenerationService } from "@conformetry/generation";

const result = await generationService.runGenerator({
  configurationDirectoryPath: "/workspace/configuration",
  definition: {
    name: "nestjs-service-module",
    templateDirectoryPath: "templates/nestjs-service-module",
  },
  inputs: { name: "billing" },
  instancePath: "packages/billing/src/modules",
});
// → { generatedFilePaths: [...], outputDirectoryPath: "..." }
```

The lifecycle is `preGenerate` → render → `postGenerate` → format, and the
rendered file paths are sorted. A path a hook pushes onto the list is appended
after the sort.

## Hooks

A generator may declare two functions that run around generation. The
[hooks example](../conformetry-examples/examples/hooks/README.md) runs both.

| Hook           | Runs                                              | `generatedFilePaths` holds    |
| -------------- | ------------------------------------------------- | ----------------------------- |
| `preGenerate`  | Before anything is written                        | Nothing: it is an empty array |
| `postGenerate` | After the template is rendered, before formatting | Every rendered path, sorted   |

Each hook receives one `GeneratorHookContext`, may be sync or async, and is
awaited. Hooks are plain functions, so a configuration cannot declare them in
JSON, which cannot carry a function; any JavaScript or TypeScript configuration
can. Import the types from
`@conformetry/configuration`, which re-exports `GeneratorHook`,
`GeneratorHookContext`, and `GeneratorHooks` from `@conformetry/core`; a
configuration needs no other dependency to type its hooks.

```ts
import path from "node:path";

import type {
  ConformetryConfiguration,
  GeneratorHookContext,
} from "@conformetry/configuration";

const configuration: ConformetryConfiguration = [
  {
    hooks: {
      postGenerate: async (context: GeneratorHookContext): Promise<void> => {
        const receiptPath = path.join(
          context.configurationDirectoryPath,
          "receipts",
          `${context.substitutions["nameKebabCase"] ?? ""}.log`,
        );

        await context.filesystem.writeFile(receiptPath, "generated\n");
        context.generatedFilePaths.push(receiptPath);
      },
    },
    name: "receipt",
    templatePath: "templates/receipt",
  },
];

export default configuration;
```

### The context

| Field                        | What it holds                                                                |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `definition`                 | The generator's runtime definition: `name`, `templateDirectoryPath`, `hooks` |
| `input`                      | The input values the run was given, by input name                            |
| `substitutions`              | What the template renders with: the name variants, then inputs over them     |
| `outputDirectoryPath`        | Where the run writes, exactly as the host passed it                          |
| `generatedFilePaths`         | The list described above. It is mutable, and what the formatter receives     |
| `filesystem`                 | The adapter the run itself reads and writes through                          |
| `configurationDirectoryPath` | Absolute directory of the configuration file that declared the generator     |

Paths differ by host:

- **`outputDirectoryPath` and `generatedFilePaths`** are whatever the host
  passed. Under the command line that is the form `--directory` was given in,
  so possibly relative. Under Nx they are absolute.
- **`filesystem` takes absolute paths only.** Build them from
  `configurationDirectoryPath`, never from the working directory, so a hook
  behaves the same however the command was started.
- **`configurationDirectoryPath` is absolute under both hosts**, taken from
  the file that was actually loaded.
- **`definition.templateDirectoryPath`** is the configuration's `templatePath`
  as written, so workspace-relative, under the command line. Under Nx it is
  resolved against the workspace root, so absolute.

There is no `replaceInFile` helper. A hook that edits a rendered file reads it
with `filesystem.readFile`, changes the text, and writes it back.

### Writing from a hook

Write through `context.filesystem`, not `node:fs`. Under the command line the
adapter writes to disk. Under Nx it writes to the generator's virtual tree, so
the write appears in the change list, `--dry-run` previews it, and nothing
reaches disk until Nx flushes. A write made with `node:fs` skips the tree: it
lands immediately, even under `--dry-run`, and stays when the run later fails.

**Write only inside the workspace.** The Nx adapter maps an absolute path
inside the workspace to a tree path. It cannot do that for a path outside, so
the write is silently re-rooted inside the workspace instead, while a read of
the same path falls back to disk. Build every path from
`configurationDirectoryPath`.

`makeDirectory` does nothing under Nx; writing a file creates its directories.
Reads through the Nx adapter look in the tree first, so a hook sees files
rendered earlier in the same run.

### The format list

The formatter receives `context.generatedFilePaths` after `postGenerate`. A
file the hook wrote is not on that list, so push its path to have it formatted:

```ts
context.generatedFilePaths.push(receiptPath);
```

The command-line host formats nothing by default, so the list there only
decides what the run reports. The Nx host formats every file changed in the
tree, hook writes included, whether or not it was pushed; push it anyway so
both hosts report the same files.

### When a hook throws

The run stops at the throw and the error propagates.

| Host         | `preGenerate` throws  | `postGenerate` throws                                                       |
| ------------ | --------------------- | --------------------------------------------------------------------------- |
| Command line | Nothing was written   | The rendered files **stay on disk**; the formatter does not run             |
| Nx           | The tree is untouched | Rendered files sit in the tree, and `nx g` flushes nothing for a failed run |

The command line prints a hook's error with its stack trace and exits non-zero.
It does not say which hook threw, so put the generator and hook name in the
message. Under Nx the run is atomic on disk for both hooks, but only for writes
made through `context.filesystem`.

## Rendering

`RenderingService` is the single owner of template substitution across the
whole toolchain. Generation renders templates to create files; validation
renders the _same_ templates to compare against files that already exist. Both
must substitute identically or validation would flag the files the generator
itself produced — which is why neither reimplements this.

Contents and paths are both rendered with
[mustache](https://mustache.github.io), HTML escaping disabled so substituted
values cannot corrupt source code. `buildNameSubstitutions` derives
`nameCamelCase`, `nameKebabCase`, `namePascalCase`, and `nameSnakeCase` from a
single name; callers merge their own inputs over the result, so an explicit
input of the same key always wins.

> **An interpolated placeholder nobody supplied raises
> `MissingSubstitutionError`.** Mustache would otherwise render it as an empty
> string rather than leaving the token visible, and because generation and
> validation render identically, both halves of the loop lost the same value and
> agreed that nothing was wrong. A hole rendered into both sides of a comparison
> is not something that comparison can report, so the renderer refuses instead.
> Validation never renders the hole either: it reads the missing value from the
> instance, and reports when it cannot.
>
> Section tags are exempt, deliberately: `{{#field}}` and `{{^field}}` are
> conditionals, so an absent name is how a template asks for a block to be
> skipped or taken. A supplied value that is the empty string is an answer too —
> only an absent key is a hole. Together those are how a template says
> "optional": ask with a section, interpolate inside it.

Paths once used a `__field__` syntax of their own, on the assumption that
braces were not portable across filesystems. They are — and the separate syntax
could not tell a placeholder from a Python dunder, so a template shipping
`__init__.py` depended on `init` never being a substitution.

## Adapters

Filesystem and formatter access go through `FileSystemAdapter` and
`FormatterAdapter`, defaulting to disk and a no-op. That is how
[`@conformetry/nx`](../conformetry-nx/README.md) reuses this runtime unchanged
against an Nx generator `Tree`. Rendering deliberately is _not_ an adapter, for
the reason above.

## Exports

`GenerationService`, `GenerationModule`, and the `DirectoryEntry`,
`FileSystemAdapter`, `FormatterAdapter`, and `GeneratorDefinition` types. The
hook types are re-exported for configurations from `@conformetry/configuration`.

## Test

```bash
nx run conformetry-generation:vitest
```

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.
