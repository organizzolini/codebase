# 🕸️ Codependix Configuration

[![npm](https://img.shields.io/npm/v/@codependix/configuration?logo=npm&label=npm)](https://www.npmjs.com/package/@codependix/configuration)

**Configuration reader, glob resolution, and boundary constraint definitions for Codependix.**

## Test

```bash
nx run codependix-configuration:vitest
```

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run codependix-configuration:coinagerie-check:write`.

- **accept**: Describes which --check names the flag resolver allows, rejecting any outside its set with a named list of valid choices.
- **acyclic**: A boundary rule kind, declared beside access rules, that forbids any cycle among the nodes its selector covers.
- **anchor**: The named HTML comment block in a Markdown file where codependix writes its generated graph, bounded by start and end markers.
- **boundary**: Declared rules, of access or acyclic kind, that codependix judges against each built graph during a boundary check run.
- **breadth**: The callidescope limit on how many direct callees one callable may have, set by maximumBreadth in callidescope.config.ts.
- **selector**: The object on each side of a boundary rule that matches nodes by id, path, project, or tags fields.

<!-- coinagerie:end -->
