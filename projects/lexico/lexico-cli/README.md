# 🚰 Lexico Ingestion

**Where the dictionary comes from.** A NestJS command-line application that
scrapes, parses, and loads the sources behind
[Lexico](../lexico-web/README.md) into the schema defined by
[lexico-db](../lexico-db/README.md).

## Quick Start

```bash
cp .env.default .env      # Database connection
nx run lexico-cli:start
```

The default command is the root pipeline, which prompts for any stage flags it
was not given and then runs the selected stages in order.

```bash
nx run lexico-cli:start -- --dictionary --literature
```

| Stage flag | Ingests |
| ---------- | ------- |
| `--dictionary` | Dictionary entries, forms, and inflections |
| `--library` | The library of works |
| `--library-sources` | The upstream sources each work came from |
| `--literature` | Lines and tokens of each text |
| `--wikipedia` | Wiktionary pages |

## Individual stages

Every stage is also its own command, addressable as a `start` configuration:

```bash
nx run lexico-cli:start:dictionary -- --startLemma=a --endLemma=c
nx run lexico-cli:start:wiktionary
nx run lexico-cli:start:clear
```

| Command | Source |
| ------- | ------ |
| `dictionary` | Dictionary entries, resumable with `--startLemma` / `--endLemma` |
| `wiktionary` | Wiktionary page dumps |
| `perseus` | The Perseus Digital Library |
| `latin-library` | The Latin Library |
| `corpus-scriptorum-ecclesiasticorum-latinorum` | CSEL, the ecclesiastical Latin corpus |
| `epigraphik-datenbank-clauss-slaby` | EDCS, the Latin inscription database |
| `library` | Library and work metadata |
| `literature` | Lines and tokens for loaded texts |
| `clear` | Empties ingested tables so a run can start clean |

The lemma range on `dictionary` is what makes a long scrape restartable: a run
that stops partway is resumed by pointing `--startLemma` at where it left off
rather than starting over.

A value given to a flag is validated, and an unknown one fails the run. A
missing value — a bare `--startLemma`, or an omitted `--provider`, `--author`,
or `--text` on `library` and `literature` — is asked for only when standard
input is a terminal; otherwise the command takes its default of no bound or
"All". A cancelled prompt, like any error a command throws, exits non-zero.

## Moving data between databases

This application does not copy tables between databases. The database
package's command line does, with `nx run persistence:start:postgresql-export` and
`nx run persistence:start:postgresql-import`. It has no default schema, so name the Lexico
schema with `--schema lexico`, or qualify each table as `lexico.words`.
A relative `--file` resolves from `projects/common/persistence`, so this keeps the dump
in this project's `data/` directory, where `*.dump` is gitignored:

```bash
nx run persistence:start:postgresql-export --args="--source-uri postgresql://user:password@localhost:5432/lexico_development --schema lexico --table words --data --ddl --file ../lexico/lexico-cli/data/lexico.dump"
```

`import --clean` runs without asking, so run `import --dry-run` with the same
options first to see what it would drop or truncate. See the
[persistence README](../../common/persistence/README.md#moving-data-between-databases) for
every option.

## How it works

Each source has its own module under `src/modules/`, holding the fetcher, the
parser for that source's markup, and the mapping into entities. HTML is parsed
with [cheerio](https://cheerio.js.org) and wiki markup through mdast, so a
change to one site's layout is contained to one module.

Nothing here defines the schema. Entities and migrations come from
[`@codebase/lexico-db`](../lexico-db/README.md), so the
shape ingestion writes and the shape the application reads cannot drift.

## Start

```bash
nx run lexico-cli:start
```

## Test

```bash
nx run lexico-cli:vitest
```

## Development

```bash
nx run lexico-cli:typecheck
nx run lexico-cli:lint-codebase --configuration=write
```

Run migrations before a first ingestion:

```bash
nx run lexico-db:migration:run
```

## Related

- 🐺 [lexico-web](../lexico-web/README.md) — the web application
- 📖 [lexico-db](../lexico-db/README.md) — the schema this writes to
- 🎨 [presentation](../../common/presentation/README.md) — the interface

## License

MIT — see [LICENSE](../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../../configuration/conformetry-templates/nestjs-command-project) conformetry template.
