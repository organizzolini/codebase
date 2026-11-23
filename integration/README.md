Everything that guards a change on its way to `main`, as tested commands: the
checks and derivations that run at commit, at push, and on a pull request, and
the steps that run around a Continuous Integration job.

- **Checks**, which run in check mode and say what to fix: `catalog-manifests`
  pins externals to `catalog:`, `lockfile` runs the frozen install, and
  `readme-projects` links every workspace project from the root README.
- **Derivations**, which check by default and rewrite with `:write`:
  `conformetry-generators`, `conventional-config`, `devcontainer-configuration`,
  `package-manifests`, `project-ports`, `skill-exclusions`, and
  `vscode-extensions`.
- **Continuous Integration plumbing**: `setup-codebase` and `cleanup-codebase`
  ready and tidy a job's Nx base and task-cache database, around the composite
  actions' cache restores and saves. Their steps are commands too:
  `bound-base-to-push`, `import-pr-task-cache`, `merge-task-cache`,
  `verify-task-database`, `adopt-task-database`, and `keep-task-database`.
  `run-affected` runs Nx affected, and `collect-codometer-baseline` and
  `report-codometer-changes` keep codometer's baseline and its pull request
  report. `upgrade-dependencies` runs the weekly dependency upgrades.

`nx run integration:start` runs the ten checks and derivations in one process,
and names the command that fixes each failure. The aggregate's CLI command is
still named `synchronization`, a name the conformetry template fixes. "Integration"
here means the change's path to `main`, not the `vitest:integration` test kind.
See [AGENTS.md](AGENTS.md).

## Start

```bash
nx run integration:start
```

## Test

```bash
nx run integration:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../configuration/ic-suite/conformetry-templates/nestjs-command-project) conformetry template.
