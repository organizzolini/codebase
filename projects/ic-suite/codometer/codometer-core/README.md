# @codometer/core

[![npm](https://img.shields.io/npm/v/@codometer/core?logo=npm&label=npm)](https://www.npmjs.com/package/@codometer/core)

The contracts leaf of the codometer toolchain. It holds what a measurement
**produces** — the per-language statistics groups, the report vocabulary a
consumer joins across runs, and the errors a configuration is refused with —
and nothing that runs.

No service and no NestJS module lives here, which is what makes it a leaf every
other codometer package may reach without dragging a container behind it. The
test that decides whether a declaration belongs here is sharp: a type the tool
produces is core, and a value somebody writes in `codometer.config.ts` is
configuration.

## Test

```bash
nx run codometer-core:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run codometer-core:coinagerie-check:write`.

- **anchor**: A named README marker pair that codometer's output writers splice generated content between, as the configuration package describes.
- **breadth**: The callidescope report section that counts direct calls per callable, listed as the Breadth table of this package.
- **pipeline**: The sequence of analyzers whose output is the aggregated CodeStatisticsResult that core's types describe.
- **selector**: A custom statistic's matcher, whose instances field records each occurrence it found, such as a comment selector's blocks.
- **statistic**: A counted value in the code statistics result, whether a built-in language field or a custom counter under custom.

<!-- coinagerie:end -->
