# @coinagerie/configuration

[![npm](https://img.shields.io/npm/v/@coinagerie/configuration?logo=npm&label=npm)](https://www.npmjs.com/package/@coinagerie/configuration)

The configuration schema, loader, and command-line flag resolution for coinagerie. It reads a `coinagerie.config.ts` and resolves the folder a run scans, what it includes and excludes, and where its glossaries are written.

```bash
npm install @coinagerie/configuration
```

## Test

```bash
nx run coinagerie-configuration:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this package uses that the root glossary does not define, regenerated with `nx run coinagerie-configuration:coinagerie-check:write`.

- **breadth**: Second callidescope limit, the count of distinct callees one callable may reach, set per project in its callidescope config.
- **forbid**: Pattern in the configuration constants that rejects a description holding a list item or HTML comment, since those would read back as glossary text.

<!-- coinagerie:end -->
