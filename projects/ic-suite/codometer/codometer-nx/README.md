# @codometer/nx

[![npm](https://img.shields.io/npm/v/@codometer/nx?logo=npm&label=npm)](https://www.npmjs.com/package/@codometer/nx)

An Nx plugin that infers a source-only limit target and a packaged-size target for every project that holds a codometer configuration at a configured path.

```bash
npm install --save-dev @codometer/nx @codometer/cli
```

## Usage

An Nx plugin that gives every project holding a codometer configuration two
targets, so `nx affected` measures only where something it reads has changed.
The `codometer` command works without it.

Register it in `nx.json`:

```json
{
  "plugins": [
    {
      "plugin": "@codometer/nx",
      "options": {
        "inputs": ["{workspaceRoot}/codometer.config.ts"],
        "projectConfigurationPath": "codometer.config.ts"
      }
    }
  ]
}
```

A project gets the targets when it has a `project.json` or named `package.json`
and a file at `projectConfigurationPath`, relative to its root. Nothing else is
searched for, and a registration without the option fails the graph with
`projectConfigurationPath is required`.

| Target            | Reads                                           | Needs   | Writes                                                  |
| ----------------- | ----------------------------------------------- | ------- | ------------------------------------------------------- |
| `codometer-limit` | the limit configuration, with no compiled input | nothing | nothing                                                 |
| `codometer-weigh` | the project configuration, compiled output too  | `build` | `codometer-report.json`, and with `-c write` the badges |

`codometer-limit` fails on a breached limit written against the source tree,
such as comment budgets and folder ceilings. It runs first and fast, because a
limit against `Compiled JavaScript` has no input without a build, so the run
reads a configuration that leaves the compiled input out. That is the project's
file at `limitConfigurationPath` when it has one, and its main configuration
otherwise. `codometer-weigh` waits for the project's `build`, then gates every
limit, packaged sizes included, and leaves the report a pull request reads.

| Option                     | Default           | Meaning                                                   |
| -------------------------- | ----------------- | --------------------------------------------------------- |
| `projectConfigurationPath` | required          | Each project's configuration, relative to its root        |
| `limitConfigurationPath`   | none              | A project's limit configuration, relative to its root     |
| `limitTargetName`          | `codometer-limit` | Name of the source-only target                            |
| `weighTargetName`          | `codometer-weigh` | Name of the packaged-size target                          |
| `command`                  | `codometer`       | What runs; `measure` and its flags are appended           |
| `inputs`                   | none              | Extra cache inputs added to every inferred target (below) |

Every project file is a cache input of `codometer-limit`, and `production` plus
its dependencies' of `codometer-weigh`. A file the project does not hold but its
configuration reads, such as a shared configuration or an ignore file, goes in
`inputs`: editing it re-runs the measurement, and a path under `{workspaceRoot}`
also makes `nx affected` select every project that declares it.

The targets run the installed `codometer` binary, so `@codometer/cli` must be
installed, or `command` must name another way to run it. To re-run every
measurement when the tool changes, declare it as an input, for example
`{ "externalDependencies": ["@codometer/cli"] }`.

The executor, `@codometer/nx:measure`, is batched: Nx hands it every project of a
run, and it measures them from one `codometer measure` process, which prints a verdict
and the failing lines for each project. A breach fails only its own
project, and nothing is measured twice.

## Test

```bash
nx run codometer-nx:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../configuration/conformetry-templates/nestjs-service-project) conformetry template.
