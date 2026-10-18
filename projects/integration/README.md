Continuous Integration plumbing: the steps that run around a CI job, as
commands. `run-affected` runs Nx affected over a change set corrected for
spelling files and conformetry templates, and the Nx task-database steps
`verify-task-database`, `adopt-task-database`, and `keep-task-database` carry
the Nx task-cache database between runs. "Integration" here means Continuous
Integration, not the `vitest:integration` test kind. See [AGENTS.md](AGENTS.md).

## Start

```bash
nx run integration:start
```

## Test

```bash
nx run integration:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../projects/configuration/conformetry-templates/nestjs-command-project) conformetry template.
