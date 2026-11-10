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
