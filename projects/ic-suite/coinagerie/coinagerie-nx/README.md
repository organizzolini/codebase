# @coinagerie/nx

[![npm](https://img.shields.io/npm/v/@coinagerie/nx?logo=npm&label=npm)](https://www.npmjs.com/package/@coinagerie/nx)

An Nx plugin that infers a coinagerie check target for every project that holds a coinagerie configuration at a configured path.

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
        "inputs": ["{workspaceRoot}/GLOSSARY.md"],
        "projectConfigurationPath": "coinagerie.config.ts"
      }
    }
  ]
}
```

A project gets the target when it has a `project.json` or named `package.json`
and a file at `projectConfigurationPath`, relative to its root. Nothing else is
searched for, and a registration without the option fails the graph with
`projectConfigurationPath is required`. The target runs
`coinagerie batch --project-configuration-path <path> <project>` and is cached.

| Option                     | Default            | Meaning                                                   |
| -------------------------- | ------------------ | --------------------------------------------------------- |
| `projectConfigurationPath` | required           | Each project's configuration, relative to its root        |
| `checkTargetName`          | `coinagerie-check` | Name of the inferred target                               |
| `command`                  | `coinagerie`       | What runs; `batch` and its flags are appended             |
| `inputs`                   | none               | Extra cache inputs added to every inferred target (below) |

The configuration file at that path and every file in the project are cache inputs. A file
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
