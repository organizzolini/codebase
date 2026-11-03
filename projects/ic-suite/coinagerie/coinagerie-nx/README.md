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

- **abort**:
- **absolute**:
- **after**:
- **alpha**:
- **array**:
- **assertion**:
- **beta**:
- **breadth**:
- **bug**:
- **callback**:
- **clear**:
- **close**:
- **compile**:
- **compiler**:
- **console**:
- **constant**:
- **controller**:
- **decorator**:
- **define**:
- **describe**:
- **each**:
- **entry**:
- **equal**:
- **experimental**:
- **factory**:
- **fake**:
- **filename**:
- **fixture**:
- **flat**:
- **force**:
- **gamma**:
- **gitkeep**:
- **homepage**:
- **implementation**:
- **injectable**:
- **instance**:
- **least**:
- **length**:
- **logger**:
- **manifest**:
- **maximum**:
- **meta**:
- **mj**:
- **mkdtemp**:
- **mock**:
- **non**:
- **nullable**:
- **posix**:
- **promise**:
- **real**:
- **recursive**:
- **relative**:
- **remove**:
- **resolution**:
- **sample**:
- **second**:
- **slice**:
- **sort**:
- **spy**:
- **strict**:
- **synthetic**:
- **temporary**:
- **timer**:
- **trim**:
- **vi**:

<!-- coinagerie:end -->
