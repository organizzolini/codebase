Everything after Node exists on a developer machine, a devcontainer, and a
session, as commands: `setup` and its steps (`shell-configuration`, `software`,
`environment-files`, `dependencies`, `local-services`), and the checks and
restores that guard a session. Those are `installed-skills`, which restores locked
skills, `vscode-settings`, which merges the workspace's VS Code settings into a
devcontainer, and `session-branch-name` and `session-worktree-name`, which check
the checked-out branch and worktree. See [AGENTS.md](AGENTS.md).

## Start

```bash
nx run installation:start
```

## Test

```bash
nx run installation:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../configuration/conformetry-templates/nestjs-command-project) conformetry template.
