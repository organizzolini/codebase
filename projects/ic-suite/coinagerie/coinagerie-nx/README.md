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
