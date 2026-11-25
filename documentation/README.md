NestJS CLI that refreshes the repository documentation from code. It also holds the documentation itself.

## Contents

| Folder           | What it holds                                                                       | Who writes it                        |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| `openwiki/`      | The generated evidence index of the codebase, starting at `openwiki/quickstart.md`  | The scheduled refresh, never by hand |
| `agents/`        | Per-repository settings the vendored skills read: issue tracker, handoffs, OpenWiki | You                                  |
| `documentation/` | Per-project reports from callidescope, codependix, codometer, and coinagerie        | Their Nx targets, never by hand      |

Not here: plans and specs are issues, conventions are skills, and a decision worth keeping lives in the README or `AGENTS.md` of the project it shapes. Notes kept here go stale.

## Start

```bash
nx run documentation:refresh-documentation
```

Needs the `OPENWIKI_*` and provider key environment variables OpenWiki reads. The 🧑‍🏫 Refresh Documentation workflow supplies them: a free OpenRouter model, with the key in the `OPENROUTER_API_KEY` repository secret.

## Test

```bash
nx run documentation:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../configuration/ic-suite/conformetry-templates/nestjs-command-project) conformetry template.
