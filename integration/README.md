Continuous Integration plumbing: the steps that run around a CI job, as
commands. `setup-codebase` and `cleanup-codebase` ready and tidy a job's Nx base
and task-cache database, around the `setup-codebase` and `cleanup-codebase`
composite actions' cache restores and saves; the steps they run are commands too:
`bound-base-to-push`, `import-pr-task-cache`, `merge-task-cache`,
`verify-task-database`, `adopt-task-database`, and `keep-task-database`.
`run-affected` runs Nx affected, adding the conformetry config when a template
changed. `collect-codometer-baseline` and `report-codometer-changes` keep
codometer's baseline and write its changes onto a pull request.
`upgrade-dependencies` runs the weekly dependency upgrades, undoing and
reporting any that fail instead of failing the job. "Integration" here means
Continuous Integration, not the `vitest:integration` test kind. See
[AGENTS.md](AGENTS.md).

## Start

```bash
nx run integration:start
```

## Test

```bash
nx run integration:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../configuration/conformetry-templates/nestjs-command-project) conformetry template.
