# @coinagerie/nx

[![npm](https://img.shields.io/npm/v/@coinagerie/nx?logo=npm&label=npm)](https://www.npmjs.com/package/@coinagerie/nx)

An Nx plugin that infers a coinagerie check target for every project that holds a `coinagerie.config.ts`.

```bash
npm install --save-dev @coinagerie/nx @coinagerie/cli
```

## Usage

An Nx plugin that gives every project holding a coinagerie configuration its
own check target, so `nx affected` runs the check only where something it reads
has changed. The `coinagerie` command works without it.

Register it in `nx.json`:

```json
{
  "plugins": [
    {
      "plugin": "@coinagerie/nx",
      "options": {
        "inputs": ["{workspaceRoot}/GLOSSARY.md"]
      }
    }
  ]
}
```

A project gets the target when its folder holds a `coinagerie.config.ts` (or
any other file name the loader reads) beside a `project.json` or `package.json`.
The target runs `coinagerie --check` from the project folder and is cached.

| Option            | Default            | Meaning                                                     |
| ----------------- | ------------------ | ----------------------------------------------------------- |
| `checkTargetName` | `coinagerie-check` | Name of the inferred target                                 |
| `command`         | `coinagerie`       | What runs; `--check` is appended                            |
| `inputs`          | none               | Extra cache inputs added to every inferred target (below)   |

The configuration file and every file in the project are cache inputs. A file
the project does not hold but its configuration reads, such as a parent
glossary behind `exclude.words`, goes in `inputs`: editing it re-runs the check,
and a path under `{workspaceRoot}` also makes `nx affected` select every project
that declares it. One project can add its own in `project.json` with the
spread entry, `"inputs": ["...", "{workspaceRoot}/other.json"]`.

The target runs the installed `coinagerie` binary, so `@coinagerie/cli` must be
installed, or `command` must name another way to run it. Its verdict also
depends on the tool itself: to re-run every check when the tool changes,
declare it as an input, for example `{ "externalDependencies": ["@coinagerie/cli"] }`.
An input may be a string or any other Nx input object.

## Test

```bash
nx run coinagerie-nx:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this package uses that the root glossary does not define, regenerated with `nx run coinagerie-nx:coinagerie-check:write`.

- **abort**: The NestJS option abortOnError, set false so a failed plugin bootstrap does not kill the Nx daemon's process.
- **beta**: A fixture package name in the plugin's unit tests, standing for a project that holds a coinagerie configuration.
- **breadth**: The maximumBreadth limit in this package's callidescope.config.ts, set to four callees per callable.
- **gamma**: A fixture package name in the plugin's unit tests, standing for a project with a project.json but no configuration.
- **mj**: The module-extension fragment of .mjs configuration file names that the plugin matches as coinagerie config variants.
- **posix**: Node's path module, the forward-slash variant used to derive a project root from a configuration file path.
- **sample**: A fixture folder name in the plugin's unit tests, holding a coinagerie.config.ts that the inference reads.

<!-- coinagerie:end -->
