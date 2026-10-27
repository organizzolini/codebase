# @coinagerie/agents

Agent skills for the coinagerie toolchain, published from this repository and
installable by any workspace that uses coinagerie.

## What lives here

- `skills/<skill-name>/SKILL.md` — one directory per skill, each self-contained.
- `testing/skills.unit.test.ts` — checks every shipped skill is structurally
  valid and that its links resolve.
- `testing/portability.unit.test.ts` — checks the package ships exactly its
  four skills, that they hold only markdown, and that none names a path, a task
  runner command, a guidance file, or another toolchain of this repository.

There is no `src/`. This package ships documentation; its only TypeScript is
the two tests above, which is why it declares no `dependency-cruiser` or
`oxlint` target.

## The constraint that shapes everything

`skills add` copies a skill **directory** into the consumer's agent skills
directory, with no manifest, no `node_modules`, and nothing beside it. The
canonical statement of what follows from that, and of why the corpus test is a
byte-for-byte copy rather than shared, is in
[`codometer-agents`](../../codometer/codometer-agents/AGENTS.md). The two
rules to keep in mind here:

- **A skill may not link outside its own directory**, and ships no script.
- **Describe the toolchain, not this workspace.** The portability test fails a
  skill that names this repository's folders, `nx`/`pnpm` commands, or sibling
  toolchains, because each would be wrong in every other repository.

## Writing a skill here

Skills are model-invoked: omit `disable-model-invocation`, and write a
`description` that is only the situations that should fire it. Front matter
needs a `name` matching the directory and a `description`; the skills tool
skips a skill missing either without saying so.

Content rules specific to coinagerie:

- **A passing check is not a defined glossary.** Empty definitions never fail
  `--check`; every skill that touches a check says so.
- **`--write` deletes stale words with their definitions.** A rename is the case
  that costs hand-written text, so the triage skill carries the definition over
  before writing.
- **Never suggest excluding a word to make a failing check pass.** Exclusion is
  for words with no meaning of their own, decided per word.
- State facts the tool actually has. Run the command before documenting its
  output; the flags, log lines, and messages in these skills were each observed.

## Validating

```bash
pnpm exec nx run-many -p coinagerie-agents -t typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write
pnpm exec nx run-many -p coinagerie-agents -t typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check
pnpm exec nx run coinagerie-agents:test-code
```

Coverage is empty by nature here — there is no source to instrument — so the
two tests are what protect the shipped output.
