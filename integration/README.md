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

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run integration:coinagerie-check:write`.

- **adopt**: Renaming the newest restored task database to this machine's id so the CI job reuses it.
- **adoption**: The AdoptionPlan that decides which restored task database to rename to this machine's id, if any.
- **baseline**: The codometer report snapshot from a green main build, which later pull requests are compared against.
- **batch**: Group of knip tasks Nx hands to one executor call, which runs knip once from the workspace root and splits its findings by project.
- **breadth**: The count of direct calls a callable makes, which callidescope caps with maximumBreadth.
- **bullet**: A single list item the upgrade-dependencies step adds to its pull request's details section.
- **charge**: Assign a knip or cspell finding to the workspace root that owns its file, so only a finding charged to a project fails that project.
- **corrupt**: A task database that fails its integrity check, which CI discards with a warning instead of restoring it.
- **explain**: Produce the report of why a project failed, by running that project alone again to get exactly what a single run prints.
- **rewrite**: Replacing a package.json field's value in place, as package-manifest does for each field it edits.
- **selector**: A path that narrows a conformetry run to one file, such as its template configuration.
- **unattributed**: Count of knip findings in files no project root owns, which no project's check can fail on and so are tallied apart.
- **unchanged**: A step outcome in which the upgrade left every file as it was, so nothing needs a pull request change.
- **unrestored**: An upgrade outcome where a failed step could not be undone, so the run stops and reports it.

<!-- coinagerie:end -->
