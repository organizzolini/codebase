# meanderaw-cli

## 🏛️ Before You Change a Meander

**A meander is a row in the `meanders` table of the Postgres database `MEANDERAW_POSTGRES_DATABASE` names
(`meanderaw_development`, schema `meanderaw`, by default), addressed by its lattice address — its Code, its rows, and its columns — and nothing else.** The formatted
Code spells out all three, so `code` alone is its identity; the row's `id` is a uuidv7
the database assigns, which changes on every draw run and must never reach committed output. There is no `output/` tree of SVG
files, no procedural motif service, and no `--type`/`--modifier` command line.
Generation is lattice-first: a budgeted enumeration produces every structurally distinct
repeat within reach, one generic renderer draws each one from its decoded Code, and what a
meander is gets _measured off_ the result rather than chosen before it. See "One Command" and "Output Layout" in [README.md](./README.md).

**The corpus is two halves that partition it, and the partition is load-bearing.**
Rows with `isHardcoded` true hold the 963 meanders of the historical corpus past the sixteen
edges it was extracted against, extracted once as Codes from the retired file tree;
`CorpusService.isPreserved` is the filter, by shape against the fixed
`HISTORICAL_CORPUS_EDGE_BUDGET` rather than the draw run's own budget, so raising
`EDGE_BUDGET` never drops one. Rows with it false hold what `EnumerationService` walks — the
twenty-five shapes the edge budget admits, one meander per symmetry class. The corpus is
ingested first, and the draw run skips any Code a hardcoded row already holds, so a hardcoded
row keeps its Code. Only enumerated meanders are folded by
symmetry: a hardcoded mirror or flip of an enumerated meander stays a row of its own.
`draw-run.command.integration.test.ts` pins how many entries are preserved.

**What bounds the enumeration is one edge budget, not a column cap.** A repeat of `rows` by
`columns` holds `columns * (2 * rows - 1)` edges, its only degrees of freedom — so a shape
holds `2 ** edges` repeats and rows and columns are not independent knobs. `EDGE_BUDGET`
caps that edge count at 24, overridable through `DRAW_EDGE_BUDGET`, and
`DRAW_MINIMUM_ROWS` sets the floor at 2, which between them admit twenty-five shapes: 2×1
through 2×8, 3×1 through 3×4, 4×1 through 4×3, 5×1, 5×2, 6×1, 6×2, and 7×1 through 12×1. A
shape past the budget is refused rather than enumerated slowly. Raising it is a one-line
change with a visible effect on the shapes `enumeration.service.unit.test.ts` asserts — which
is the point of it being one number. The suites that run a whole draw run pin their own budget
of 12 through `DRAW_TEST_EDGE_BUDGET` in `testing/draw-run.ts`, so raising the default
does not slow them.

**A draw run keeps one meander per symmetry class, and draws them across threads.**
`TileEnumerationService.orbitMinima` walks every edge assignment as a bitmask and keeps
only those no element of the symmetry group sends lower — one per class, without building
the rest — and `canonicalTile` folds each to the representative the corpus stores. The
rest of the class is recorded, not lost: `symmetricalCodes` holds the Codes of its mirror,
flip, and both, each at its own canonical rotation (a column shift is already folded by
`canonicalRotation`). Drawing a row is the expensive part, so `DrawPoolService` deals each
shape's minima in batches to `DRAW_WORKERS` threads booted from `src/worker.ts`, sorts
the rows back into edge-key order, and the main thread inserts them with one prepared
multi-row `INSERT` per chunk. `DRAW_WORKERS=0` draws in-process, which every suite pins
through `DRAW_TEST_WORKERS`; `draw-pool.service.integration.test.ts` is the one that
drives real threads.

**A draw run commits nothing.** The rows live in Postgres, and `output/index.html` and a page
per pattern characteristic (`output/patterns/<key>.html`) are written on every draw run but
gitignored — at the default budget they are gigabytes of HTML. `DrawIndexService.build`
hands each page over as an async iterable of pieces, read from
`DatabaseService.patternRows` a batch at a time, because a page outgrows a
JavaScript string; never build one as a single string or read every row first.

**There are no families: a meander is filtered by its Characteristics.** No row stores a
label. A _pattern characteristic_ is a compound boolean under `compound/pattern/` — `isWhirl`,
`isArcade`, and so on — built only from other Characteristics, and listed in
`PATTERN_CHARACTERISTIC_KEYS`. A meander can hold several patterns or none; most of the
enumerated space holds none, which is the design rather than a gap. Adding a pattern means
adding an evaluator there and its key to that list, never a motif service or a stored column.

**A hardcoded row is measured, never labelled.** The historical corpus keeps only each
entry's Code and shape; the directory a drawing was once filed under is gone, so a hardcoded
meander holds a pattern for exactly the reason an enumerated one does.

**A duplicate lattice address within one half is a build failure.** The unique index over
`code` refuses a second insert. Across the halves the hardcoded row wins by design: the
corpus is ingested first and the draw run skips the Codes it already holds, which is a skip
rather than an upsert — an enumerated meander never overwrites a row.

**No row stores its drawing.** The renderer draws each meander from its Code, rows, and
columns when the index pages are built, so a renderer change needs no database change at
all. Nothing currently checks the database against a fresh draw run, either; a Code's
uniqueness is the one property the schema enforces.

### The charter, and what became of its gate

Meander geometry is governed by a charter of seven invariants, five of which are fixed.
They were extracted by measuring the 9,877 SVG files this repository used to commit, so
they are facts about output rather than intentions in source. The full charter, with the
measurements behind it, is in [README.md](./README.md), under "Meander Charter".

**The property test that gated them is gone with the corpus it drawn.** It measured every
drawing the procedural draw run produced, and that draw run no longer exists; the structural
facts it asserted are now computed per row by `CharacteristicsService` and stored in the
bridge's rows (`meander_characteristics`), so they are queryable rather than gated.
Rebuilding a gate over the database is open work, not something this project claims to
have.

**Every Characteristic is a catalog row and, where it holds, a bridge row, and a missing row
means zero or `false`.** No Characteristic has a column of its own, so adding one needs no
schema change.
Raw SQL reads one by joining `meander_characteristics` to `characteristics` on its key; a
meander with no row for it holds 0, so a zero filter needs an anti-join.

The three invariants that most often catch a change:

- **Space-filling.** Every interior white channel is exactly one stroke width — which
  equals half a grid unit. `GridGeometryService` derives stroke width and offset from the
  grid unit for this reason; setting either independently breaks the invariant silently.
- **No branching and no crossing.** These are the charter's two negotiable invariants, and
  the lattice-first corpus relaxes both wholesale: the enumerated space is every subset of
  a repeat's edges, junctions and crossings included. `forkCount` and `crossCount`, and the
  four directional fork counts behind them (`northForkCount`/`southForkCount`/
  `eastForkCount`/`westForkCount`), are recorded in each row's `characteristics` map
  rather than forbidden.
- **Band, not field.** Canvas height is fixed and `rows` sets density, not size. These
  patterns are meant for borders.

Two things that look like defects and are not:

- **Gaps wider than one stroke where a band terminates** are expected, and owned by
  [#338](https://github.com/Organizzolini/codebase/issues/338). Do not chase them.
- **Most enumerated rows holding no pattern characteristic at all** is the design.
  Enumeration produces every structurally distinct repeat within budget, and which patterns
  hold is measured afterwards.

### Module Graph

The modules this project defines and the imports between them are exported by
[codependix](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli)
into the `## 🕸️ Codependix` section of [README.md](README.md), alongside this
project's Nx neighborhood and its file-level import graph. Regenerate all three
with:

```bash
nx run configuration:codependix:write
```

```bash
nx run infrastructure:postgres:up     # The local Postgres the database lives in
nx run meanderaw-db:migration:run             # Build or update the meanders table
nx run meanderaw-cli:start                    # Clear the meander rows, then draw every meander back into them
nx run meanderaw-cli:typecheck-code,lint-code,format-code,deprecate-code,guard-code   # Every static check, in one graph
nx run meanderaw-cli:typecheck       # tsc --noEmit
nx run meanderaw-cli:oxfmt           # Formatting
```

This application has **one command, `draw`**, and it is the default — so `start` runs it,
and it always writes the database `MEANDERAW_POSTGRES_DATABASE` names. With no arguments it clears that
database's meander rows and draws every meander the application can draw back into it: the whole lattice's unit space, enumerated
and measured, then the historical corpus's hardcoded Codes beyond that budget. With
`--rows`, `--columns`, and `--code` it decodes, measures, and persists that one:

**Nothing but `start` runs the command**, so no aggregate target — `guard-code`, `lint-code`,
or any other — rewrites the database as a side effect. Keep it that way: a `dependsOn` on
`start` would run a full draw run on every check.

**The database lives in Postgres, not in the repository.** Meanderaw uses the shared convention
from `@codebase/persistence`: the local Docker init creates the `meanderaw_development` database,
the `meanderaw` schema inside it, and the `meanderaw_username` role that owns both, the defaults
of `MEANDERAW_POSTGRES_DATABASE`, `MEANDERAW_POSTGRES_SCHEMA`, and `MEANDERAW_POSTGRES_USERNAME`. Every
meanderaw variable carries the `MEANDERAW_` prefix, so the unprefixed `POSTGRES_*` the root
`.env` sets as the container's admin login — which Nx loads into every task — never reaches it.

**The `meanders` table is built by migrations, never by synchronizing.** `Meander` extends
`PostgresqlUpdatableEntity`, so its `uuidv7()` id and audit columns come from the shared package, and the
migrations live in `projects/meanderaw/meanderaw-db/migrations/`. After changing the entity run
`nx run meanderaw-db:migration:generate`, and `nx run meanderaw-db:migration:run` to apply it; the
`start` target never migrates, so run the migrations before the first draw run. The CLI reads its
data source from `@codebase/meanderaw-db`, whose `migration` target finds it through the `module` option.

A draw run commits nothing: the HTML pages it writes stay in the gitignored `output/`. Integration suites start
their own throwaway `postgres:18-alpine` container, migrated by the real migrations, through
`startDatabaseTestingModule` from `@codebase/persistence/testing` against `meanderaw_testing`, so Docker
must be running to test them. `DatabaseModule` is the project's own database module and
is passed to that helper as `database`.

There is deliberately no second command, and no other flag — see "One Command" and
"Output Layout" in [README.md](./README.md).
