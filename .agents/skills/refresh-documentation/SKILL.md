---
name: refresh-documentation
description: "Audit the hand-written documentation (READMEs, AGENTS.md files, skills, and documentation/) against the code and fix what drifted. Use when asked to refresh or audit documentation, or after a change moved commands, paths, or conventions."
license: MIT
---

# Refresh Documentation

Audit the hand-written documentation against the code and fix what drifted. The generated documentation is not part of this: the weekly 🧑‍🏫 Refresh Documentation workflow regenerates the OpenWiki pages under `documentation/openwiki/` with `nx run documentation:refresh-documentation`, and nobody hand-edits them (see [openwiki.md](../../../documentation/agents/openwiki.md)).

## Scope

| Path                                         | What it is                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                  | The root README, with its project table (`nx run integration:readme-projects` checks it)                              |
| `AGENTS.md`                                  | Workspace instructions; `.claude/CLAUDE.md` and `.github/copilot-instructions.md` are symlinks to it                  |
| `<project>/AGENTS.md`, `<project>/README.md` | Per-project instructions and readmes                                                                                  |
| `.github/CONTRIBUTING.md`                    | The contributor narrative                                                                                             |
| `documentation/**/*.md`                      | Agent configuration, guides, and research, except `documentation/openwiki/` and dated `documentation/planning/` notes |
| `.agents/skills/*`                           | Skills this repository authors; never vendored ones, which `skills-lock.json` lists                                   |

Leave generated blocks alone — anything between marker comments (types and scopes tables, the PR template, codometer badges, glossaries, codependix and callidescope reports). Regenerate them with their own `write` target instead.

## Workflow

### 1. Audit

For each file in scope, cross-check every command, path, target, and claim against the code. Run commands rather than trusting them; read `nx.json` and `project.json` for targets; follow every relative link. Classify each finding:

| Category       | Criteria                                                                | Action                    |
| -------------- | ----------------------------------------------------------------------- | ------------------------- |
| **Deprecated** | Documents a feature, command, file, or skill that no longer exists      | **Remove**                |
| **Outdated**   | Exists but is described wrongly: a path, a command, a count, a behavior | **Update**                |
| **Missing**    | A project, convention, or workflow exists but nothing documents it      | **Create**                |
| **Duplicated** | The same fact stated in several places that can drift apart             | **Link** to the one owner |

### 2. Act

- Fix each finding where the fact is **owned**, and link to it from elsewhere rather than copying it.
- Keep each skill description to about 40 words and never over 64, within a shared 12,288-character budget (`nx run integration:skill-descriptions`), and each skill's long reference material under its `references/`.
- Match a table's style to its file: some are column-aligned, others are not, and markdownlint holds each table to its own header.

### 3. Validate

Run the [validate-code skill](../validate-code/SKILL.md) on what changed, which covers markdownlint, cspell, and the skill and README checks.

## References

- [AGENTS.md](../../../AGENTS.md) — Workspace-level instructions
- [install-skills](../install-skills/SKILL.md) — Where skills live and which are vendored
