# ⏲️ Codometer Languages

[![npm](https://img.shields.io/npm/v/@codometer/languages?logo=npm&label=npm)](https://www.npmjs.com/package/@codometer/languages)

**Language parsers and comment analyzers across TypeScript, JSON, Markdown, Python, and SQL for Codometer.**

## Test

```bash
nx run codometer-languages:vitest
```

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run codometer-languages:coinagerie-check:write`.

- **anchor**: YAML node property holding a reusable node's name, which the YAML comment service reads as a string when present.
- **breadth**: Limit on how many calls a function may make, which the languages service keeps within by avoiding an extra split.
- **budget**: Per-statistic allowance of words, lines, or characters for one comment block, judged by the comment measurement.
- **counter**: Custom statistic that tallies matching declarations or comments, configured per selector and shared by the TypeScript and comment services.
- **pipeline**: Shell pipe operator counted as joining two commands, and the measurement pipeline collaborator the languages service holds.
- **prop**: Shortened CSS declaration property, read as node.prop so custom properties beginning with a double dash can be counted.
- **reader**: Per-syntax comment reader that the comments module provides, one for each comment syntax, such as Python or HCL.
- **selector**: Config key naming which comments a custom statistic counts, such as the comment selector a budget is attached to.
- **splice**: Array splice call that empties a list of temporary directories in the CSS and language comment tests.

<!-- coinagerie:end -->
