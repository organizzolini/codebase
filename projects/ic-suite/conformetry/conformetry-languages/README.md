# 👔 Conformetry Languages

[![npm](https://img.shields.io/npm/v/@conformetry/languages?logo=npm&label=npm)](https://www.npmjs.com/package/@conformetry/languages)

Every Language [Conformetry](../conformetry-cli/README.md) compares files with,
behind one import — plus the resolution that decides which of them a run needs.

```bash
npm install --save-dev @conformetry/languages
```

## The Languages

A **Language** is the comparison engine for one family of file types. Each is a
module of its own, exposing a NestJS module and a service, and each declares the
extensions it claims.

| Module | Claims | What it compares |
| ------ | ------ | ---------------- |
| `json` | `.json`, `.jsonc` | Every key and value the template declares, addressed by JSON path rather than line number |
| `jupyter` | `.ipynb` | A notebook's envelope, markdown cells, and code cells, by delegating to `json`, `markdown`, and `python` |
| `markdown` | `.md` | The document's syntax tree — headings, lists, links — rather than its rendered text |
| `python` | `.py` | Python's own abstract syntax tree, through the interpreter shipped in `src/python/` |
| `text` | `.txt` | Every template line, duplicate-aware and order-independent |
| `typescript` | `.ts`, `.tsx` | Declarations, signatures, and comments, through the TypeScript compiler |

Every one of them is a lower bound rather than an exact specification: an
instance may add what its template does not mention.

## Resolution and the Fallback

`LanguagesService` takes the extensions a run's templates declare and returns
the Languages that claim them, so a repository of JSON never reports a
TypeScript result it had nothing to say about.

An extension **no** Language claims is not skipped. It is routed to the
**Fallback** — the text Language, widened to also claim those extensions, and
compared line by line. That is what stops a `.toml` or a `.cfg` in a template
from going unchecked, and it is why the text Language is a floor under every
run rather than one option among six.

Registering a Language is a single step: add it to `claimingLanguages` in
`LanguagesService`. Its own descriptor says which extensions it claims, so
there is no second list to keep in step.

## The Python bridge

`python/` holds a small Python package, and `PythonBridgeService` spawns
`python3` against it, because Python's syntax tree is only available from
Python. The path is resolved from the service's own module location rather than
from a working directory, so the bridge is found the same way whether
conformetry runs from a checkout or from `node_modules`.

The interpreter is spawned inside a method, never at module scope, so importing
this package on a machine without `python3` is harmless. A missing interpreter
surfaces as a reported Difference on the `.py` files — visible, rather than
mistaken for conformance.

## Exports

`LanguagesModule` and `LanguagesService`, each Language's module and service,
and the helper services the Languages are built from —
`JsonComparisonService`, `JupyterNotebookService`, `MarkdownNodesService`,
`MarkdownTreeService`, `PythonBridgeService`, `TypescriptCommentsService`,
`TypescriptNodesService`, and `TypescriptTreeService`.

A host almost always wants `LanguagesModule`, which imports and re-exports all
six.

## Why one package

These six Languages were six packages until the consolidation recorded in
[ADR 0006](../../../../documentation/adr/0006-hold-every-conformetry-language-in-one-package.md).
That record is the place to read what installing this package costs a consumer
who needs only one Language, why paying it won, and which three alternatives
were weighed and rejected.

## Test

```bash
nx run conformetry-languages:vitest
```

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.
