# @codometer/agents

Agent skills for the [codometer](../codometer-cli) toolchain.

Codometer measures a directory and reports what it counted, gated by whatever
limits a configuration declares. This package documents that for coding
agents, so an agent facing a breached limit or a stale report knows what
question to ask before reaching for the configuration file.

## Installing

The skills describe the toolchain rather than any one workspace, so they work
in any repository that uses codometer. Install them with the
[skills](https://github.com/vercel-labs/skills) CLI, naming the skills
directory explicitly:

```bash
npx skills add Organizzolini/codebase/projects/ic-suite/codometer/codometer-agents/skills --skill '*'
```

Naming the directory matters. A bare repository reference searches this
repository's own agent skills directory first and would offer every skill it
holds, most of which are specific to this workspace.

## The skills

| Skill | Reach for it when |
| ----- | ----------------- |
| [codometer-measure](skills/codometer-measure/SKILL.md) | Running a measurement, choosing where the report goes, or reading a badge block or JSON report |
| [codometer-configure](skills/codometer-configure/SKILL.md) | Writing a `codometer.config.ts` — targets, limits, declared convention counters, exclusions, output destinations |
| [codometer-triage](skills/codometer-triage/SKILL.md) | A limit was breached, or a committed report reads stale |

The split mirrors three distinct moments: running the tool, telling it what to
enforce, and acting on what it said.

## Why there are no bundled scripts

An installed skill is a copied directory with no manifest and no dependencies
beside it, so a script shipped inside one can import nothing but Node
built-ins. Capability an agent needs lives in `@codometer/cli` instead, where
it is versioned and tested, and the skills name the command.

## Editing

The skills here are the source of truth. This repository consumes them the
same way it consumes any installed skill, through `skills-lock.json`, so a copy
also appears under the repository's agent skills directory — edit the copy in
this package, never that one.

## Validating

```bash
pnpm exec nx run codometer-agents:lint-code --configuration=write
pnpm exec nx run codometer-agents:lint-code --configuration=check
pnpm exec nx run codometer-agents:test-code
```

Coverage is empty by nature here — there is no source to instrument — so the
corpus test in `testing/skills.unit.test.ts` is what protects the shipped
output.

## License

MIT — see [LICENSE](../../../../LICENSE).

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run codometer-agents:coinagerie-check:write`.

- **triage**: Name of the skill for acting on a breached limit or a stale committed report, the third of this package's three skills.

<!-- coinagerie:end -->
