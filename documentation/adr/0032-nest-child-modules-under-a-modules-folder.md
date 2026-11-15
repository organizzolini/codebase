# 0032: Nest Child Modules Under a Modules Folder

Narrows the module rule of [ADR 0011](0011-hold-one-path-law-for-every-project-type.md), which [ADR 0008](0008-judge-structure-in-one-eslint-pass.md) enforces in one ESLint pass.

## Context

A module folder under `src/modules/` could hold any kebab-case subfolder, and a subfolder accepted any file name. Ten modules had grown one: `events/filters/`, `lexemes/forms/`, `library/providers/`, four levels of `characteristics/`, and the database modules' `entities/` and `migrations/`. Files that the module rule would have refused, such as `*.provider.ts` and `*.builder.ts`, passed only because they sat one folder down. Nothing said whether a subfolder was a module of its own, a grouping of files, or a framework's convention.

A module that outgrows its folder still needs somewhere to go. Codometer's tree ceilings now cap how many entries one directory holds, so flattening a subfolder back into its parent is often not an option.

## Decision

A module folder holds module files and at most three named folders:

- **`modules/`** holds child module folders, judged by the same rule as any module, so nesting can repeat. A child module is where a module that outgrows its folder splits.
- **`entities/`** holds TypeORM entity classes, `*.entity.ts`, and nothing else. Persistence documents it as the database module's layout, and entities are found by the `src/**/*.entity.ts` glob, not by their folder.
- **`migrations/`** holds what the TypeORM command line generates, timestamped, into the folder a project's `migration` target names. Its contents are not hand-arranged, so its files are not judged.

Every other subfolder is refused. The ten modules moved onto this rule: each grouping folder became a child module under `modules/`, the lexico command line's providers became services, and lexico-db's nested `entities/form/` and `entities/inflection/` became the `forms` and `inflections` child modules, each with its own `entities/` folder.

## Consequences

- A module folder's subfolders say what they hold, and every file in a hand-written folder carries a module file suffix.
- Nesting adds two path segments per level. A tree depth ceiling bounds how far that repeats, and a module nested too deep becomes a package of its own instead.
- Conformetry's `nestjs-service-module` template still matches `src/modules/*` only, so a child module is not yet judged against a template.
