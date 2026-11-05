# @coinagerie/core

[![npm](https://img.shields.io/npm/v/@coinagerie/core?logo=npm&label=npm)](https://www.npmjs.com/package/@coinagerie/core)

The contracts leaf of the coinagerie toolchain: the glossary and vocabulary-report shapes and the constants every other coinagerie package shares. It holds no behavior.

```bash
npm install @coinagerie/core
```

## Test

```bash
nx run coinagerie-core:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this package uses that the root glossary does not define, regenerated with `nx run coinagerie-core:coinagerie-check:write`.

- **anchor**: The start and end HTML comment markers bounding the generated glossary block in a markdown destination, which the tool rewrites.
- **breadth**: The callee fan-out per function that callidescope caps here through maximumBreadth, set to one in this package's configuration.
- **glossary**: The headword-to-definition mapping a destination stores, listing each word the codebase uses with its meaning here.
- **malformed**: Describes a glossary destination that cannot be fully parsed, so MalformedGlossaryError stops the run rather than dropping words.
- **stale**: A word a destination lists that the code no longer uses; the check reports it and a write drops it.
- **vocabulary**: The set of words the codebase uses, which the report compares against each glossary destination to find missing and stale words.

<!-- coinagerie:end -->
