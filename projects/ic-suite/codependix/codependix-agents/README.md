# @codependix/agents

Agent skills for the [codependix](../codependix-cli) toolchain.

Codependix reads what each project in an Nx workspace depends on and exports it
as JSON and Mermaid diagrams. This package documents that for coding agents, so
an agent asked to export a dependency graph reaches for the configuration
rather than for a flag that does not exist — and an agent scoping a refactor
reads a graph the repository already committed instead of re-deriving it.

## Installing

The skills describe the toolchain rather than any one workspace, so they work in
any repository that uses codependix. Install them with the
[skills](https://github.com/vercel-labs/skills) CLI, naming the skills directory
explicitly:

```bash
npx skills add Organizzolini/codebase/projects/ic-suite/codependix/codependix-agents/skills --skill '*'
```

Naming the directory matters. A bare repository reference searches this
repository's own agent skills directory first and would offer every skill it
holds, most of which are specific to this workspace.

## The skills

| Skill | Reach for it when |
| ----- | ----------------- |
| [codependix-export](skills/codependix-export/SKILL.md) | Running an export, choosing `--check` against `--write`, pointing a run at a workspace root or a configuration file, or reading an exported Mermaid block or JSON graph |
| [codependix-configure](skills/codependix-configure/SKILL.md) | Writing a `codependix.config.ts` — which graph types run, per-project overrides, include/exclude globs, the workspace graph, and where each export lands |
| [codependix-triage](skills/codependix-triage/SKILL.md) | A `--check` reported stale, a project failed its export, an anchor is missing, a NestJS container failed to boot, or a `--write` produced nothing |
| [codependix-navigate](skills/codependix-navigate/SKILL.md) | Reading a committed graph to answer a question — what depends on this, what a rename would touch, whether an import cycle is real |

The first three mirror conformetry's generate / configure / validate and
codometer's measure / configure / triage: run the tool, tell it what to
enforce, act on what it said.

The fourth is codependix's own. Its exports are standing reference artifacts
rather than pass/fail reports, so "read a graph somebody already committed" is a
moment the other two toolchains do not have — and it fires on questions
(`what depends on this`, `what would this rename touch`) that share no
vocabulary with running an export. Since a skill's `description` is its entire
trigger surface, folding that into `codependix-export` would have meant it never
fired for the questions it answers.

## Why there are no bundled scripts

An installed skill is a copied directory with no manifest and no dependencies
beside it, so a script shipped inside one can import nothing but Node built-ins.
Capability an agent needs lives in `@codependix/cli` instead, where it is
versioned and tested, and the skills name the command.

## Editing

The skills here are the source of truth. This repository consumes them the same
way it consumes any installed skill, through `skills-lock.json`, so a copy also
appears under the repository's agent skills directory — edit the copy in this
package, never that one.

## Validating

```bash
pnpm exec nx run codependix-agents:lint-code --configuration=write
pnpm exec nx run codependix-agents:lint-code --configuration=check
pnpm exec nx run codependix-agents:test-code
```

Coverage is empty by nature here — there is no source to instrument — so the
corpus test in `testing/skills.unit.test.ts` is what protects the shipped
output.

## License

MIT — see [LICENSE](../../../../LICENSE).
