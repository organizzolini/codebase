# 🔭 Callidescope Output

[![npm](https://img.shields.io/npm/v/@callidescope/output?logo=npm&label=npm)](https://www.npmjs.com/package/@callidescope/output)

**Renders call-graph findings into markdown, mermaid, and JSON output formats.**

This package sits between
[`@callidescope/graph`](../callidescope-graph/README.md), which it depends on
for the shapes it renders, and
[`@callidescope/cli`](../callidescope-cli/README.md), which orchestrates a run
and hands this package the findings.

```bash
npm install --save-dev @callidescope/output
```

## What This Package Owns

- **`output-markdown`** — anchored-block splicing into markdown files
- **`output-json`** — JSON file output
- **`report`** — assembles findings, as markdown or a mermaid diagram, into the reportable shape
- **`project-reports`** — per-project report sections, scoping a run's findings to the project each one came from

## Test

```bash
nx run callidescope-output:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run callidescope-output:coinagerie-check:write`.

- **anchor**: Start or end marker that delimits a generated block inside a markdown file, so a splice can replace it.
- **breadth**: Width of a call graph as reported in the breadth section, measured against maximumBreadth.
- **callable**: Function, method, or constructor declaration that a report lists by display name, id, and stacks.
- **headroom**: Measure of how far a stack or callable sits below its limit, bucketed into labeled ranges for the report.
- **splice**: Replace the anchored region of a markdown file with freshly generated text, keeping everything outside it.
- **staleness**: Verdict that extracted anchored content has drifted from a fresh render, decided by comparing both blocks.
- **trace**: Call-stack walk recorded for an address or project, the traced paths the report renders.
- **unmeasured**: Headroom bucket and reading for a callable with no depth measurement, labeled no stacks in reports.
- **unread**: Project whose files a run never read, which a report flags rather than counting as clean.

<!-- coinagerie:end -->
