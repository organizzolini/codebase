# @codometer/measurement

[![npm](https://img.shields.io/npm/v/@codometer/measurement?logo=npm&label=npm)](https://www.npmjs.com/package/@codometer/measurement)

What codometer actually measures. It finds the files a run covers, counts their
compressed and uncompressed size, evaluates whatever counters a configuration
declares of its own, and holds every measured metric to the limits written
against it.

One package rather than four. Discovery, size, customization, and limits are
each a handful of files that only ever run together, and none of them imports
another — so the join that a measurement is had to live somewhere, and it lives
here rather than in the command-line host that used to hold it.

## Test

```bash
nx run codometer-measurement:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.
