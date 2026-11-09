# 🔭 Callidescope Core

[![npm](https://img.shields.io/npm/v/@callidescope/core?logo=npm&label=npm)](https://www.npmjs.com/package/@callidescope/core)

**The domain vocabulary every other Callidescope package speaks.**

This package is the contracts leaf of the Callidescope spine: it declares what a
run produces — call graphs, stacks, frames, findings — and depends on nothing.
It holds no service and no NestJS module, so importing a result type never drags
a configuration loader or a TypeScript program behind it.

```bash
npm install --save-dev @callidescope/core
```

## What This Package Owns

- **`call-graph`** — the result and finding vocabulary: `CallGraphResult`,
  `ProjectReport`, `CallStack`, `StackFrame`, `CallableNode`, `CallEdge`,
  `DeepStackFinding`, `WideCallableFinding`, and the identifiers and locations
  they are built from

The sharp test for what belongs here: a type describing **what the tool
produced** is core; a type describing **what the user wrote in
`callidescope.config.ts`** belongs in
[`@callidescope/configuration`](../callidescope-configuration/README.md).

## Test

```bash
nx run callidescope-core:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run callidescope-core:coinagerie-check:write`.

- **breadth**: The count of distinct direct callees one callable has, computed for every callable whether or not a limit is configured.
- **callable**: Any function or method the call graph can name and trace, identified by a path plus the byte offset of its declaration.

<!-- coinagerie:end -->
