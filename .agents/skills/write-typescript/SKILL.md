---
name: write-typescript
description: "TypeScript conventions for this codebase: strict typing, naming and imports, formatting and ordering, control flow, error handling with Zod at boundaries, and size limits. Use when writing or changing TypeScript or TSX, or when a type or lint error appears."
license: MIT
---

# Write TypeScript

All TypeScript projects in this codebase use strict settings. This skill is the entry point and links to focused reference files so guidance stays organized and maintainable.

## When to Use This Skill

Use this skill when:

- Writing or refactoring `.ts` or `.tsx` files
- Fixing TypeScript compile or lint errors
- Reviewing strict-mode type-safety issues
- Standardizing naming, import style, or control-flow patterns

## References

- [Strict typing](./references/strict-typing.md)
  : strict flags, explicit return types, `any` avoidance, `unknown`, promises, exhaustive switches.
- [Naming and imports](./references/naming-and-imports.md)
  : identifier naming, abbreviation rules, file naming, type imports, NodeNext `.js` extensions.
- [Class and control flow](./references/class-and-control-flow.md)
  : readonly properties, braces, early returns, object shorthand, template literals.
- [Error handling](./references/errors.md)
  : Zod at boundaries, catch typing and narrowing, logging, and bounded retries. Test typing and mocks live in [write-tests](../write-tests/SKILL.md).
- [Formatting and ordering](./references/formatting-and-ordering.md)
  : `oxfmt` settings, import groups, enforced alphabetical order, the 3-parameter
  limit, JSDoc on public APIs.
- [Size limits](./references/size-limits.md)
  : file length, function length, block nesting depth, parameter limits, complexity, comment block sizes.

## Related Skills

- [Write comment](../write-comments/SKILL.md)
- [Validate code](../validate-code/SKILL.md)

## Verification

After TypeScript changes, run the [validate-code skill](../validate-code/SKILL.md): `typecheck-code` covers `tsc` and type coverage, and `lint-code` covers ESLint and oxlint.

## Notes

- Keep this `SKILL.md` concise and discovery-focused.
- Add detailed examples and larger workflows to files under `references/`.
- > ✅ **Best practice:** In NestJS class files such as `*.service.ts`, `*.command.ts`, `*.resolver.ts`, `*.loader.ts`, and `*.module.ts`, keep only imports and the class at top level. Move helper types and interfaces to `*.types.ts`, constants to `*.constants.ts`, and shared initialization logic into class members or dedicated modules.
- > ⚠️ **Warning:** Do not use top-level alias exports or type re-exports from NestJS class files. Import supporting symbols from their source `*.types.ts` or `*.constants.ts` file instead of re-exporting them through the class file.
