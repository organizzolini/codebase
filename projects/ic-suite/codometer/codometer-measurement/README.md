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

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run codometer-measurement:coinagerie-check:write`.

- **anchor**: Stem of anchored, as in the discovery test's note that a leading-slash ignore pattern is anchored at the repository root.
- **boundary**: Repository edge passed to the inputs constructor, beyond which an input configuration is not allowed to reach.
- **breadth**: Callidescope maximumBreadth limit this package holds itself to, set to nine in its own callidescope configuration.
- **budget**: Per-comment allowance checked in the customization pass, judged against each comment block's own configured limit.
- **bundle**: Compiled JavaScript output that this package's own codometer config measures, held to a 32 KB size limit.
- **counter**: Custom metric that measures files by path, declarations by symbol, or comments, as the customization service describes.
- **pipeline**: Measurement pipeline, the sequence of inputs, discovery, size, and limits services that one codometer run passes through.
- **selector**: Config key naming which files or declarations a custom statistic counts, such as a language or a documentable kind.
- **statistic**: Named metric a custom configuration computes, such as a comment-selector statistic with its own breach and budget.
- **unbind**: Describes a limit path that names no measured target, which codometer cannot bind to a metric in the measurement.
- **unqualified**: Limit path with no target name in front, which the limits integration tests hold against the default target.

<!-- coinagerie:end -->
