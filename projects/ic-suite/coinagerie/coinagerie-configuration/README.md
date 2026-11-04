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
- **discriminate**: Zod discriminatedUnion keyed on the type field, selecting the JSON or markdown output schema for each glossary destination.
- **exact**: Exclusion by whole word, the plain string form of an exclude.words entry, as opposed to a regular expression that matches a pattern of words.
- **forbid**: Pattern in the configuration constants that rejects a description holding a list item or HTML comment, since those would read back as glossary text.
- **prettify**: Call to z.prettifyError that renders a zod validation failure as readable text in the message a rejected configuration prints.
- **refine**: Custom Zod check on the description schema that adds the list-item and HTML-comment rule beyond the plain string type.

<!-- coinagerie:end -->
