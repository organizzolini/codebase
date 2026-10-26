---
type: domain
title: Meanderaw — Greek Meander Enumeration & Classification
description: CLI application that enumerates Greek key/fret patterns into Postgres by lattice address (Code), measures structural characteristics and classifies compound pattern booleans, then streams HTML index pages to disk for exploration via a web app.
tags: [meanderaw, greek-meander, enumeration, postgres, classification, pattern-generation]
sources:
  - id: openwiki-source-f06ea58f0c5e89bd4694952c
    resource: repo://documentation/adr/0014-give-every-meander-a-canonical-phase.md
  - id: openwiki-source-9cf51fe4b0da373914e95bf3
    resource: repo://documentation/adr/0020-store-meanders-in-postgres.md
  - id: openwiki-source-a0469017ebf26d7dec53a3bb
    resource: repo://documentation/adr/0021-stop-committing-the-meander-pages.md
  - id: openwiki-source-dcb52b26c445faa758e30156
    resource: repo://projects/meanderaw/meanderaw-cli/AGENTS.md
  - id: openwiki-source-a6e80b612169ffb94413f377
    resource: repo://projects/meanderaw/meanderaw-cli/README.md
  - id: openwiki-source-d8f4b3f15cd18fc729f7df07
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.constants.ts
  - id: openwiki-source-4c85eface01cd2a486ef3cd1
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts
  - id: openwiki-source-6d825c6e6c04e655b8871e4a
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts
  - id: openwiki-source-69605df3064da7760db0b640
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/database/entities/meander.entity.ts
  - id: openwiki-source-9a130645e22c0f670dbce0ae
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts
  - id: openwiki-source-60b305fbaae19507838e8393
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts
  - id: openwiki-source-578ca54f8ef879d697e4f3af
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts
  - id: openwiki-source-b50d57ab455eabfb405e8c93
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts
generated: { by: "openwiki/0.7.0", at: "2026-10-24T21:02:40.299Z" }
---

# Meanderaw — Greek Meander Enumeration & Classification

**Meanderaw** is a NestJS command-line application that enumerates every structurally distinct Greek key/fret pattern (meander) within a configurable edge budget, stores each as a row in a Postgres database keyed by its **Code** (a lattice address), measures and classifies it with a sparse JSON map of **Characteristics**, and finally streams complete HTML index pages — one per pattern characteristic — to a gitignored `output/` directory. A companion web application (`meanderaw-web`) explores the generated corpus.

## The Code System: Lattice Address as Identity

Every meander is addressed by its **Code**, a self-contained string that encodes the entire lattice. The Code format is:

```
{columns}x{rows}y{lattice}[r{repeats}]
```

- `columns` and `rows` are zero-padded to two digits (e.g., `02x03y...`)
- `lattice` is a sequence of lowercase hexadecimal digits, one per interior lattice point in reading order (row-major)
- Each digit packs four direction bits: **8 = North, 4 = South, 2 = East, 1 = West**
- `r{repeats}` suffix appears only when `repeats > 1`, also zero-padded to two digits

Example: `02x02y4488` — a 2×2 lattice whose four points spell `4 4 8 8` (south, south, north, north).

**Canonical phase.** A meander repeats horizontally; shifting its columns cyclically yields the same infinite band. `CodeService.canonicalPhase` chooses the phase that **minimizes the tile-crossing component delta** (the number of edges crossing tile boundaries), breaking ties by lexicographically smallest digit string. This canonical phase is the one stored in the `code` column, so two drawings that differ only by a horizontal shift share the same Code.

The formatted Code is the meander's entire identity: the unique index over `code` is the only uniqueness constraint in the schema. The `lattice`, `rows`, and `columns` columns are denormalized copies for filtering and ordering.

## Database Schema

Table: `meanderaw.meanders` (schema `meanderaw`, database `meanderaw_development` by default).

| Column | Type | Purpose |
|--------|------|---------|
| `id` | `uuid` | `uuidv7()` assigned by Postgres 18 on insert; sorts by write time; changes on every draw run, never reaches committed output |
| `code` | `text` | Formatted Code — **unique index**, the meander's identity |
| `rows` | `bigint` | Band row count (density) |
| `columns` | `bigint` | Repeat column count |
| `lattice` | `text` | Bare hexadecimal digits (no `rows`/`columns` prefix) |
| `repeats` | `bigint` | How many times the unit repeats (default 1) |
| `is_hardcoded` | `boolean` | `true` = historical corpus row or `--code` drawing; `false` = enumerated |
| `symmetrical_codes` | `text[]` | Codes of the mirror, flip, and mirror+flip at their own canonical phases, sorted; empty when all reflections map the meander to itself |
| `characteristics` | `jsonb` | **Sparse map of every measured Characteristic**; numeric keys present only when non-zero, boolean keys present only when `true`; missing key = zero or `false` |

All columns are snake_case via the shared `SnakeNamingStrategy` so raw SQL never quotes them.

### The `characteristics` Map

The `jsonb` column holds **every Characteristic** in a single sparse map. This design (per [ADR 0018](../../documentation/adr/0018-store-every-characteristic-in-one-sparse-json-map.md)) allows adding, renaming, or removing a Characteristic without a schema migration.

- **Numeric Characteristics** (structural counts): `forkCount`, `crossCount`, `dotCount`, `bettiNumber0Count`, letter glyph counts (`aSoutheastLatinCount`, `daletSouthwestHalfHebrewCount`, …)
- **Boolean Characteristics** (structural properties): `isDots`, `isReducible`, `hasTJunctions`, `hasXJunctions`, `isWhirl`, `isArcade`, `isBars`, `isBoxes`, `isChain`, `isClasps`, `isComb`, `isCross`, `isDoubleChain`, `isFork`, `isLines`, `isMesh`, `isParallel`, `isPureTree`, `isSnake`, `isSwirl`, `isWaterfalls`, `reversesAtItsTightestTurn`

A meander with two isolated dots (`01x02y00`) stores only:

```json
{"bettiNumber0Count":2,"dotCount":2,"isDots":true}
```

In raw SQL a key is read as `COALESCE((characteristics ->> 'key')::numeric, 0)`; the `?` operator tests boolean presence. A GIN or expression index can target a single key.

## Two Halves of the Corpus

The `meanders` table is partitioned by `is_hardcoded` into two disjoint halves that together form the complete corpus.

### Hardcoded Half (Historical Corpus)

- **963 meanders** (at the default budget) that lie **beyond the 16-edge budget** the historical corpus was extracted against
- Ingested once as Codes from the retired file tree (`CorpusService.ingest`)
- Each row measured exactly like an enumerated row — no stored family label, no motif type
- Filtered by **shape** against the fixed `HISTORICAL_CORPUS_EDGE_BUDGET` (16), not by Code, so raising the draw run's `EDGE_BUDGET` never drops a hardcoded meander
- Ingested **first**; the draw run skips any Code a hardcoded row already holds — a hardcoded row keeps its Code, an enumerated meander never overwrites it
- A `--rows --columns --code` single drawing is also recorded as `is_hardcoded = true`

### Enumerated Half (Lattice Enumeration)

- Every structurally distinct repeat the lattice's edge budget admits
- **One number bounds the space:** `EDGE_BUDGET` (default 24, overridable via `DRAW_EDGE_BUDGET`) caps the tile's edge count `columns * (2 * rows - 1)`; `DRAW_MINIMUM_ROWS` (default 2) sets the floor
- At the default budget this admits **25 shapes**: 2×1 through 2×8, 3×1 through 3×4, 4×1 through 4×3, 5×1, 5×2, 6×1, 6×2, 7×1 through 12×1
- A shape past the budget is **refused** rather than enumerated slowly
- Enumeration walks every edge assignment as a bitmask (`2 ** edges` assignments) and keeps **only those no symmetry element sends lower** — `TileEnumerationService.orbitMinima` uses `SymmetryService.edgePermutations` as byte lookup tables so the walk never builds the full class
- `SymmetryService.canonicalTile` folds each kept minimum to the representative the corpus stores (minimizing a `signature` based on point `rank` then `edgeKey`)
- The rest of the symmetry class is recorded in `symmetrical_codes` (mirror, flip, both at their canonical phases) — not lost, just folded
- Drawing is the expensive step, so `DrawPoolService` deals each shape's minima in batches to `DRAW_WORKERS` threads (`src/worker.ts`), sorts results back into edge-key order, and the main thread bulk-inserts with one prepared multi-row `INSERT` per chunk (`MEANDER_INSERT_CHUNK_SIZE` bounded by Postgres's 65,535 parameter limit)

**Duplicate lattice address within one half is a build failure** — the unique index over `code` refuses the second insert. Across halves the hardcoded row wins by ingestion order.

## Characteristic System: Measured, Not Labelled

Nothing in the database stores a family name, motif type, or pattern label. A meander **is** its measured Characteristics.

### Pattern Characteristics

A **pattern characteristic** is a compound boolean evaluator under `compound/pattern/` built only from other Characteristics. The list is `PATTERN_CHARACTERISTIC_KEYS`:

```
isArcade, isBars, isBoxes, isChain, isClasps, isComb, isCross, isDots,
isDoubleChain, isFork, isLines, isMesh, isParallel, isPureTree, isSnake,
isSwirl, isWaterfalls, isWhirl
```

A meander can hold several patterns or none; most of the enumerated space holds none — this is the design, not a gap. Adding a pattern means adding an evaluator and its key to `PATTERN_CHARACTERISTIC_KEYS`, never a motif service or a stored column ([ADR 0023](../../documentation/adr/0023-filter-meanders-by-characteristics-alone.md)).

### Structural Characteristics

- **Guaranteed by construction** (no assignment of direction bits can violate them):
  1. Orthogonal only — horizontal and vertical movement, no diagonals
  2. Space-filling — every interior white channel is exactly one stroke width
  3. Band, not field — fixed canvas height, `rows` is density, tiling is horizontal
- **Demoted to measured Characteristics**:
  - No branching → `hasTJunctions` (present in `branch`, `negative`, `parallel` where border strips have depth, `mosaic` enumerated, `chain`/`snake` under `edge`/`edge-flip`)
  - No crossing → `hasXJunctions` (present in `cross`, `mosaic` enumerated, `negative` under `brick-straight`, `brick-upright`, `grid`)
- **May be relaxed by ADR only**: Flat path model — unordered paths, no z-order, one stroke width per document
- **Band termination**: invariants hold within a band, not at its termination ([#338](https://github.com/Organizzolini/codebase/issues/338))

The full charter with measurements is in `projects/meanderaw/meanderaw-cli/README.md` under "Meander Charter".

## The Single Draw Command

Meanderaw has **one command**, `draw`, which is the default — `nx run meanderaw-cli:start` runs it.

| Invocation | What it does |
|------------|--------------|
| `nx run meanderaw-cli:start` | **Full enumeration**: clears the `meanders` table (`TRUNCATE`), ingests the hardcoded corpus, then enumerates every admitted shape, draws each meander, computes Characteristics, and bulk-inserts rows |
| `nx run meanderaw-cli:start --args="--rows <n> --columns <n> --code <code>"` | **Single drawing**: inserts/updates that one meander in the same database (requires all three flags; `--code` selects this mode) |

There is **nothing else to pass** — `--type`, `--modifier`, `--strands`, `--branches`, `--direction`, `--flip`, `--offset`, `--sub-family`, `--repeat-count`, `--output-directory` are all retired with the procedural generation they named.

### Draw Run Pipeline

1. `DatabaseService.clear()` — `TRUNCATE meanders`
2. `CorpusService.ingest()` — writes 963 hardcoded rows (Codes from retired file tree)
3. `DrawEnumerationService.drawAll()`:
   - For each admitted shape: `TileEnumerationService.enumerate(rows, columns)` → symmetry-folded `Tile[]`
   - `DrawPoolService` distributes tiles to worker threads (`DRAW_WORKERS`, default 0 = in-process)
   - Each worker: `DrawWorkerService.map()` → `SymmetryService.canonicalTile` → `CodeService.spellCanonical` → `DrawRecordService.record` (computes Characteristics, `CodeService.symmetricalCodes`, `CodeService.reduceToUnit`)
   - Main thread: `DatabaseService.saveAll()` — chunked prepared multi-row `INSERT` in one transaction
4. `DrawCommand.writePages()` → `DrawIndexService.build()` streams HTML pages

The integration test suites pin their own budget (`DRAW_TEST_EDGE_BUDGET=12`, `DRAW_TEST_WORKERS=0`) so raising the default budget does not slow them.

## Output: Streamed HTML Pages

A draw run commits **nothing to git**. Rows live in Postgres; HTML pages are written to `output/` (gitignored) on every draw run.

```
output/
  index.html        jump list, one link per pattern page
  patterns/
    isWhirl.html    every meander where isWhirl = true, drawn
    isArcade.html   every meander where isArcade = true
    ...             one file per PATTERN_CHARACTERISTIC_KEYS
```

**Each page is an async iterable of HTML pieces**, never one string — at the default budget a pattern can hold over a million meanders and its page outgrows the maximum JavaScript string length (`RangeError: Invalid string length`).

- `DatabaseService.patternShapeCounts(keys)` runs **one grouped query** first, so every heading (shape + count) is written before any row is read
- `DatabaseService.patternRows(key, batchSize)` yields batches of 5,000 rows via cursor-style pagination over the index `(rows, columns, code)` — no page is ever one read
- `DrawingService.render(CodeObject)` produces the SVG for one repeat; the page lays the tile out `BAND_REPEAT_COUNT` (default 8) times along a band so the repeating pattern is visible
- Each meander's SVG element is named `meander-<code>` so it changes only when the drawing changes

At the default budget (24 edges) the pages total **~7.7 GB** (`cross.html` alone is ~4.8 GB). They are complete records, not meant for comfortable browsing; paginating them is the natural next step if they are browsed often.

## Web Application

`meanderaw-web` (TanStack Start) provides a browser interface to explore the generated corpus. It reads the same Postgres database and renders pattern pages on demand rather than pre-generating gigabytes of static HTML.

## Key Architectural Decisions

| ADR | Title | Relevance |
|-----|-------|-----------|
<!-- openwiki: broken internal link [../../documentation/adr/0004-assign-one-direction-per-tile-edge.md] file "../../documentation/adr/0004-assign-one-direction-per-tile-edge.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| [0004](../../documentation/adr/0004-assign-one-direction-per-tile-edge.md) | Assign One Direction Per Tile Edge | Tile crossing definition used by canonical phase scoring |
<!-- openwiki: broken internal link [../../documentation/adr/0014-canonical-phase-is-the-crossing-minimum.md] file "../../documentation/adr/0014-canonical-phase-is-the-crossing-minimum.md" does not exist. Fix the href or restore the target, then delete this comment. -->
| [0014](../../documentation/adr/0014-canonical-phase-is-the-crossing-minimum.md) | Canonical Phase Is the Crossing Minimum | Canonical phase minimizes tile-crossing component delta |
| [0018](../../documentation/adr/0018-store-every-characteristic-in-one-sparse-json-map.md) | Store Every Characteristic in One Sparse JSON Map | Single `jsonb` column for all Characteristics |
| [0020](../../documentation/adr/0020-store-meanders-in-postgres.md) | Store Meanders in Postgres | Postgres over committed SQLite; uuidv7 ids; snake_case; jsonb characteristics |
| [0021](../../documentation/adr/0021-stop-committing-the-meander-pages.md) | Stop Committing the Meander Pages | Pages streamed to gitignored output/; async iterable pieces; counts first |
| [0022](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md) | Give Every Database Project Its Own Database Schema and Role | `meanderaw` schema, `meanderaw_username` role, migrations not synchronize |
| [0023](../../documentation/adr/0023-filter-meanders-by-characteristics-alone.md) | Filter Meanders by Characteristics Alone | No families/labels; pattern characteristics are compound booleans |

## Local Development

```bash
# Start Postgres container
nx run infrastructure:postgres:up

# Run migrations (creates/updates meanders table)
nx run meanderaw-cli:migration:run

# Full draw run (regenerates everything)
nx run meanderaw-cli:start

# Single drawing
nx run meanderaw-cli:start --args="--rows 02 --columns 03 --code 02x03y4488"

# Run tests
nx run meanderaw-cli:vitest
```

Environment variables (in `projects/meanderaw/meanderaw-cli/.env`, copied from `.env.default`):

- `MEANDERAW_POSTGRES_HOST`, `MEANDERAW_POSTGRES_PORT`, `MEANDERAW_POSTGRES_USERNAME`, `MEANDERAW_POSTGRES_PASSWORD`, `MEANDERAW_POSTGRES_DATABASE`, `MEANDERAW_POSTGRES_SCHEMA`
- `DRAW_EDGE_BUDGET` (default 24), `DRAW_MINIMUM_ROWS` (default 2), `DRAW_WORKERS` (default 0 = in-process)

The `MEANDERAW_` prefix avoids collision with the workspace root's unprefixed `POSTGRES_*` variables (lexico's shared database).
