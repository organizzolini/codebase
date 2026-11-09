# Size Limits

Hard ESLint errors apply to source files. Test files (`*.test.ts`, `testing/**`) and `*.config.*` files are exempt from all of them, so a large test file is fine and a large service file is not.

| Limit                                         | Max                                                |
| --------------------------------------------- | -------------------------------------------------- |
| Lines per file (`max-lines`)                  | 512                                                |
| Lines per function (`max-lines-per-function`) | 128                                                |
| Statements per function (`max-statements`)    | 16                                                 |
| Block nesting depth (`max-depth`)             | 4                                                  |
| Nested callbacks (`max-nested-callbacks`)     | 3                                                  |
| Classes per file (`max-classes-per-file`)     | 1                                                  |
| Function parameters (`better-max-params`)     | 3 — constructors 12, functions in `*.module.ts` 12 |
| Cyclomatic complexity                         | 8 (warning)                                        |
| Nested `describe` blocks                      | 3                                                  |

When a file nears 512 lines, split it along the module file suffixes (`*.types.ts`, `*.constants.ts`, another `*.service.ts`) instead of raising the limit. Never add a disable comment or edit the threshold to make a file fit.

**Comment blocks are budgeted per block**, declared in
`configuration/codometer.config.ts` and enforced by codometer rather than ESLint, so a breach names a file and line rather than a rule. A block must satisfy its word and line limits together; there is no character limit, because formatters already hold a line to 80 columns.

| Comment | Words | Lines |
| ------- | ----- | ----- |
| Plain comment (`//`, `#`, `/* */`), any language but shell | 48 | 8 |
| Shell comment (looser: a script header documents usage and order) | 256 | — |
| JSDoc on a class | 64 | 14 |
| JSDoc on any other declaration (function, method, interface, property, enum, accessor) | 24 | 8 |

Lines include the `/**` and `*/` delimiters. Tags such as `@param` count as words, so keep the why and drop what a type already says. JSDoc on a `const`, type alias, property signature, or file header is not reached by a `kind` and is ungated. The `codometer-configure` skill covers how a block is delimited and which languages are measured how accurately; `codometer-triage` covers a breach.

**Compiled size is gated per project** by each `codometer.config.ts`, and `configuration:codometer` gates the repository-wide limits. Both run through `make-projects` rather than 🧑‍💻 Lint Codebase, because a project has to compile before it can be measured.
