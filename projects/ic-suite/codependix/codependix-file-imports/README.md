# 🕸️ Codependix File Imports

[![npm](https://img.shields.io/npm/v/@codependix/file-imports?logo=npm&label=npm)](https://www.npmjs.com/package/@codependix/file-imports)

**TypeScript and JavaScript file-level import graph extraction and circularity detection for Codependix.**

## Test

```bash
nx run codependix-file-imports:vitest
```

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run codependix-file-imports:coinagerie-check:write`.

- **breadth**: How many callables one function calls directly, as callidescope measures it and bounds it with maximumBreadth.
- **canonical**: Not a term of its own here; the project identifies a file by the symlink-resolved path that toRealPath returns.
- **grammar**: Sample module name, src/grammars.py, that the Python import tests and docstrings use as an example import.
- **mutable**: Not a term this project uses; its types mark data readonly rather than mutable, so the word is a stray match.
- **qualifier**: Separator joining a project name to a file or module name in a graph node, such as project/src/index.ts.
- **restrict**: ESLint no-restricted-imports rule, which bans importing @nx/devkit outside the nx-projects package so only it depends on Nx.

<!-- coinagerie:end -->
