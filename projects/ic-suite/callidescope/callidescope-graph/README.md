# 🔭 Callidescope Graph

[![npm](https://img.shields.io/npm/v/@callidescope/graph?logo=npm&label=npm)](https://www.npmjs.com/package/@callidescope/graph)

**Builds the call graph from traced TypeScript source and measures its depth and breadth.**

This package is the leaf of the
[`@callidescope/cli`](../callidescope-cli/README.md) package graph: it depends
only on [`@callidescope/configuration`](../callidescope-configuration/README.md)
and `@codebase/observability`, and nothing here reaches into
[`@callidescope/output`](../callidescope-output/README.md).

```bash
npm install --save-dev @callidescope/graph
```

## What This Package Owns

- **`program`** — compiles the traced TypeScript projects
- **`workspace`** — resolves which projects and files are in scope
- **`callables`** — discovers the callable declarations
- **`entry-points`** — resolves configured entry points
- **`class-hierarchy`** — resolves interface members to concrete implementations, capped by `MAXIMUM_IMPLEMENTATION_CANDIDATES`
- **`signatures`** — reads callable signatures
- **`documentation`** — reads a callable's documentation comment
- **`edges`** — resolves call sites to callee declarations
- **`graph`** — assembles the above into `CallGraph`/`CondensedGraph` and measures depth and breadth over it

## Test

```bash
nx run callidescope-graph:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run callidescope-graph:coinagerie-check:write`.

- **breadth**: Width of a call graph, counting distinct callees per frame and compared to the maximumBreadth limit.
- **callable**: Function, method, or constructor declaration that the call graph tracks as a node, identified by CallableId.
- **canonical**: Normalized spelling of a file name, such as getCanonicalFileName in test host stubs that returns it unchanged.
- **disambiguator**: Trailing line-number suffix that separates two callables sharing one address, such as a line suffix after the name.
- **element**: Bracket-indexed call target such as obj with a key in brackets, recognized by isElementAccessExpression during symbol resolution.
- **leaf**: Callable with no outgoing callees, a terminal frame that ends a stack and is counted as its depth.
- **quiet**: Dropping something without reporting it, as a lookup that quietly finds nothing rather than failing.
- **sibling**: Directory at the same level as another one, which containment checks must never treat as inside it.
- **splice**: Remove a run of members from the pending stack once a component closes, taking everything from one index onward.
- **trace**: Analyze a project code to build its call graph, starting from entry points and following each call site.

<!-- coinagerie:end -->
