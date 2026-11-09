## Start

```bash
nx run infrastructure:postgres:up
nx run meanderaw-cli:migration:run
nx run meanderaw-cli:start
```

Meanderaw follows the workspace's shared Postgres convention, from
[`@codebase/persistence`](../../common/persistence/README.md): the `meanderaw_development`
database holds a `meanderaw` schema, both owned by the `meanderaw_username` role. The local
Postgres container creates all three the first time its volume starts empty; on a volume that
predates that, [ADR 0022](../../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md)
describes how to add them without discarding what the volume holds.

The `meanders` table is built by a migration, never by synchronizing. Run the migrations
before the first draw run, and again whenever a new one lands:

```bash
nx run meanderaw-cli:migration:run        # Build or update the meanders table
nx run meanderaw-cli:migration:generate   # After editing the Meander entity, write the next migration
```

The connection is the `MEANDERAW_POSTGRES_HOST`, `MEANDERAW_POSTGRES_PORT`,
`MEANDERAW_POSTGRES_USERNAME`, `MEANDERAW_POSTGRES_PASSWORD`, `MEANDERAW_POSTGRES_DATABASE`, and
`MEANDERAW_POSTGRES_SCHEMA` variables, set in this project's `.env` (copied from
`.env.default`) and defaulting to the local container's `meanderaw_username` role, its
`meanderaw_development` database, and its `meanderaw` schema. The `MEANDERAW_` prefix keeps
them apart from the unprefixed `POSTGRES_*` variables the workspace root's `.env` sets as the
container's admin login, which Nx also loads into every task and which meanderaw never reads.

## 🖌️ One Command

Meanderaw has one command, `draw`, and it is the default — so `nx run meanderaw-cli:start` runs it.
Both of its modes write the Postgres database `MEANDERAW_POSTGRES_DATABASE` names, and which one runs is
decided by whether a Code was named:

| Invocation | What it does |
| ---------- | ------------ |
| `nx run meanderaw-cli:start` | Regenerates every meander the application can draw, as rows in that database — clearing the rows already there first, so it runs against the database as-is |
| `nx run meanderaw-cli:start --args="--rows <n> --columns <n> --code <code>"` | That one, as a single row in the same database |

The three flags of the single-drawing mode go together: `--code` is what
selects that mode over the draw run, and it is refused without both `--rows` and
`--columns`, since passing none of the three is how the draw run is asked for.

**There is nothing else to pass.** `--type`, `--modifier` and the parameters it carried
(`--strands`, `--branches`, `--direction`, `--flip`, `--offset`), `--sub-family`,
`--repeat-count`, and `--output-directory` are all retired with the procedural
generation they named a drawing in. A meander is addressed by its lattice address — its
Code, its rows, and its columns — and by nothing else.

## Test

```bash
nx run meanderaw-cli:vitest
```

## 🗂️ Output Layout

```text
output/
  index.html        the jump list, one link per pattern page
  patterns/*.html   every meander one pattern characteristic holds for, drawn
```

A draw run commits nothing. The rows live in Postgres rather than in the repository — see
[ADR 0020](../../../documentation/adr/0020-store-meanders-in-postgres.md) — and the pages are written on
every draw run but gitignored: at the default edge budget's millions of rows they are gigabytes
of HTML, each page streamed to disk a batch of rows at a time because one pattern's page
outgrows a JavaScript string — see
[ADR 0021](../../../documentation/adr/0021-stop-committing-the-meander-pages.md).

That is the whole of it, and the shrinking is the point of this design rather than a side
effect of it. `output/` used to hold 9,877 committed SVG files under ten family
directories, plus a 2 MB `index.html` linking them and a 9,883-line
`output/lattice-addresses.md` recording each drawing's Code — because several of those
directories' full Codes run past the 255-byte limit a filesystem imposes on one path component, which
forced six of the ten into a "shape-only" filename that dropped the Code entirely and
left the address table as the only place it survived. A database row has no such limit,
so the constraint is gone rather than worked around.

**Every row is reproducible from its own Code.** No drawing is stored: the generic
renderer draws a meander from its `code`, `rows`, and `columns` whenever
the index pages are built, so a row holds the Code and what was measured off it.

### What a row holds

A `meanders` row has one column per fact about the row itself, and one JSON map for
everything measured off it:

| Column | Type | Holds |
| ------ | ---- | ----- |
| `id` | uuid | A uuidv7 the database assigns on insert, so ids sort by when their rows were written |
| `code` | text | The formatted Code, such as `02x02y4488` — unique across the table |
| `rows` | integer | The band's row count |
| `columns` | integer | The repeat's column count |
| `lattice` | text | The Code's bare hexadecimal digits |
| `repeats` | integer | How many times the filed Code repeats its unit |
| `is_hardcoded` | boolean | True for a historical-corpus row or a `--code` drawing, false for an enumerated one |
| `characteristics` | jsonb | Every Characteristic, in one sparse map |

Columns are snake case, so raw SQL never quotes one.

**`characteristics` holds every Characteristic, and leaves out every zero and every
`false`.** A numeric key — a structural count such as `forkCount`, or a letter count such
as `aSoutheastLatinCount` — holds its value only when it is not zero, and a boolean key,
`isReducible` included, holds `true` only when it holds. Two dots in a two-row band,
`01x02y00`, store this and nothing else:

```json
{"bettiNumber0Count":2,"dotCount":2,"isDots":true}
```

So **a missing key means zero or `false`**. Read one as `characteristics.forkCount ?? 0`
in TypeScript, and as `COALESCE((characteristics ->> 'forkCount')::numeric, 0)` in raw
SQL — a bare `->>` is `NULL` for a missing key, and silently drops that row from any filter
on zero or less-than:

```sql
SELECT code FROM meanderaw.meanders -- the default MEANDERAW_POSTGRES_SCHEMA
WHERE COALESCE((characteristics ->> 'crossCount')::numeric, 0) = 0
  AND characteristics @> '{"isBars": true}';
```

A Characteristic added, renamed, or removed needs no schema change, which is why every one
of them shares the map rather than taking a column: see
[ADR 0018](../../../documentation/adr/0018-store-every-characteristic-in-one-sparse-json-map.md).

**Nothing checks the database against a fresh draw run.** A drift check used to
run on every commit, and a `drawingHash` column fed it; both are gone, for now — see
[ADR 0019](../../../documentation/adr/0019-drop-the-drift-check-and-the-drawing-hash.md). The one
property the schema enforces is that a Code is unique, so after changing the renderer, the
enumerator, or a Characteristic, regenerate the database with `nx run meanderaw-cli:start`.

**Two halves fill the table, told apart by `isHardcoded`, and they partition the corpus
rather than overlapping.**

- **Enumerated** — every structurally distinct repeat the lattice's edge budget admits,
  at each of the fourteen shapes it admits one at: 30,279 meanders, found by walking the
  space rather than by drawing a named shape. Which pattern characteristics hold for a
  row is measured off its own structure, and most rows hold none.
- **Hardcoded** — the 965 meanders of the historical corpus that lie _beyond_ that
  budget, preserved as Codes extracted once from the retired file tree and measured
  exactly as an enumerated row is. See `CorpusService.isPreserved` for exactly where the
  boundary sits and why the filter is by shape rather than by Code.

A duplicate lattice address within either half is a build failure rather than a convention
nobody checks: the formatted Code spells out the lattice, rows, and columns, so the unique
index over `code` refuses the second insert. Across the two, the hardcoded corpus is
ingested first and the draw run skips any Code a hardcoded row already holds, so a hardcoded
meander keeps its row.

`output/index.html` and the pattern pages beside it are rebuilt from the database at the
end of every draw run, and are gitignored rather than committed; nothing checks a draw run
against a committed copy. `.codometerignore`, `.prettierignore`, and `cspell` all leave
the directory alone.

## 🏛️ Meander Charter

Every meander shares a set of properties that describe how it looks. The charter was
measured over the ten generator families this project once drew, which are retired — see
[ADR 0023](../../../documentation/adr/0023-filter-meanders-by-characteristics-alone.md) — so the
family names below record where each measurement came from. Three of those properties — orthogonality, space-filling channels, and the band
model — are **guaranteed by construction**: no assignment of direction bits to a lattice
can violate them, so no family gates them and none ever could. The other two — branching
and crossing — are **demoted to measured characteristics**, `hasTJunctions` and
`hasXJunctions`, rather than kept as invariants with declared exceptions: whether a
family's ink branches or crosses is measured, never gated, and a family is free to do
either as much as its own structure earns.

The counts below were extracted from the ten families as they stand, by measuring every
committed SVG rather than by reading the code — the method a declared-invariant framework
once formalized and that this section keeps as the record of why each family's ink looks
the way it does. `cross` crosses, and `negative`, `branch`, and `parallel` all branch — in
different shapes. `negative` crosses too, in three of its ten modes, and that is not a
second family creeping in: a survey of the retired `mosaic` space found that 3,070 of the 3,179 `mosaic` tiles it measured have a
crossing negative, so a `negative` family that crossed nowhere was drawing the 3.3%
minority of its own source space.

`parallel` was the exception until this corpus was drawn: it branched nowhere. **That
changed.** Ruling both borders of its band — the same closing `branch` takes, though there
the rules stand a lattice row clear of the ink — meets each strand's rising end with west,
east, and south ink at one lattice point, so 642 of its 786 drawings fork. Not every
drawing forks: the other 144 are the `serpentine` drawings whose first and last strips are
each one lattice row deep, where the flat ribbon on such a strip _is_ the rule and nothing
rises to meet it — a **structural condition** rather than a blanket count. See
`documentation/adr/0006-close-both-band-borders-in-branch-and-parallel.md` for why both borders were
closed and what it cost.

`mosaic` branches and crosses too, and only in its **enumerated half alone** — which is now
the whole of it. Its unit space is every assignment of direction bits over a lattice, and
most of that space branches and crosses; the four named modes it once had, `plain`,
`split`, `alternated`, and `dot`, did neither, and they are gone. This is still recorded in
`meander-topology.service.integration.test.ts` with a `permutations` flag, measured from
committed output rather than from a generated drawing.

| # | Invariant | Status |
| --- | --- | --- |
| 1 | **Orthogonal only** — horizontal and vertical movement, no diagonals | Guaranteed by construction |
| 2 | **Space-filling** — every interior white channel is exactly one stroke width | Guaranteed by construction |
| 3 | **No branching** — ink contains no T-junctions | Demoted to characteristic `hasTJunctions` — present in `branch` in every mode, in `negative` in every mode but `ruled-closed`, in `parallel` wherever a border strip has depth, in `mosaic` across its enumerated half, and in `chain` and `snake` under `edge` and `edge-flip` |
| 4 | **No crossing** — ink contains no X-junctions | Demoted to characteristic `hasXJunctions` — present in `cross` except under `interrupted`, in `mosaic` across its enumerated half, and in `negative` under `brick-straight`, `brick-upright`, and `grid` |
| 5 | **Band, not field** — fixed canvas height, `rows` is density, tiling is horizontal | Guaranteed by construction |
| 6 | **Flat path model** — unordered paths, no z-order, one stroke width per document | May be relaxed by ADR only |
| 7 | Invariants hold within a band, not at its termination | See [#338](https://github.com/Organizzolini/codebase/issues/338) |

What the measurements found. They were taken across the 114 named patterns and 3,179
enumerated `mosaic` tiles that existed before `cross`; every count below is restated
against the corpus as it now stands, 1,118 named patterns beside 8,759 enumerated tiles.
The named half was 174 until the draw run's row range was raised to the command line's own,
and it has moved with every family that gained a mode or a parameter since — and, when
closing both band borders left four names drawing what another name already drew, with the
four that were deleted, and again with `branch`'s six two-row drawings, which insetting
that family's figure from its own rules put below its structural minimum; the enumerated
half was 3,554 until `mosaic` was capped at 6 rows, 449 after that, and 8,759 once that
family's matching rule was replaced by an edge budget over a lattice. Most of these counts
have moved several times for those reasons alone — see the note under "Meander Charter"
above:

- **Every interior white channel is exactly one stroke width**, in all 9,877 files. The
  channel width equals the stroke width equals half a grid unit, and that single number
  is the same in every document the project has ever written — the stroke is `unit / 2`
  at every row count, in every family, at every ply of `parallel`. #340 and #413 both
  inferred from this that drawing `N` strands would mean `strokeWidth = unit / (2N)`;
  that inference is wrong and is discarded, for the reasons under "The Parallel Family"
  below.
- **Ink never crosses itself, except where a family was added to make it.** Zero
  X-junctions across all 138 named drawings the six original families produce — a stronger
  statement than "non-self-intersecting", and the sharpest single characterization of what
  those six have in common. The `cross` family relaxes it deliberately: 12 X-junctions in
  each of the seven solid documents it commits. `negative` relaxes it too, in three of its
  ten modes and 30 of its 100 documents — `brick-straight` is stack bond, whose mortar runs
  unbroken both ways where running bond's does not, `grid` inverts the `dots` sub-family,
  and `brick-upright` inverts `diamond` — for 705 X-junctions between them. Its permutation
  half crosses in 136 of its 208 drawings, which is the same finding at the scale of a
  whole space rather than of three named modes. Nowhere else in the 9,877-file corpus.
  `cross` carries twelve at every one of its row counts, 6 through 12, so its count is a
  property of the repeat count rather than of `rows`.
- **Ink branches in four places, and only there.** 22,918 T-junctions across 848 of the
  1,118 named patterns. 360 of them, across 36 patterns, are `chain` and `snake` under
  `edge` and `edge-flip`, ten per document at every row count: the `edge` family widens the
  repeat unit past the zigzag it contains, so the zigzag's terminating vertical lands in
  the _interior_ of the band border rather than at its end, and the border runs on either
  side of it — five such junctions along the top border, five along the bottom. An earlier
  reading of this measurement reported zero everywhere; the reference assets are
  hand-verified ground truth for what these patterns should look like, so the geometry is
  right and the count was wrong. The other 22,558 are the point of three families rather
  than a side effect of anything: 3,054 across the `negative` family's 90 branching
  documents, 2,130 across all 80 of `branch`'s, and 17,374 across 642 of `parallel`'s 786
  — see "The Negative Space Family", "The Branching Family", and "The Parallel Family"
  below.
- **The corpus was a forest with a few trees in it, and now it has none.** Read as a
  graph, a document's ink is lattice points joined by one-pitch steps, and a **tree** is
  the case where those points form one connected piece with `edges = nodes − 1`. Until
  both border rules were closed the corpus held 110 of them — `branch`'s 88, which were
  spanning trees of the band's lattice, and the 22 one-strand `serpentine` drawings, each
  a single ribbon that simply did not end before the band did. Both routes ran through an
  open border, and ruling both borders closed both — but not the same way, which is the
  part worth keeping. A ribbon that meets a rule at each end closes a loop, so it leaves
  the tree set by gaining an edge. `branch` briefly left it that way too, and now leaves
  it by falling apart instead: its figure is inset by a lattice row from every rule beside
  it, so each rule is a piece of its own and the drawing is a forest of two or three. By
  either route, **not one of the 9,877 committed documents is a tree**. 5,817 of the
  9,877 are forests of many components and 4,060 carry a loop, where before the two halves
  stood at 6,390 and 3,418. What was measured is still the
  interesting thing — a corpus this large containing exactly two shapes of ink graph — and
  the trees turn out to have been an artifact of two families having a border left open.
- **The negative space branches and crosses freely.** It branches in every family, and it
  genuinely crosses in 203 of the 1,118 named drawings — every one of them `parallel`
  under `serpentine` — and in the `diamond` sub-family, which is the shape the `mosaic
  split` modifier drew before that family stopped drawing motifs. Crossing patterns
  are already generated here; they have only ever been white, never ink.

Invariant 1 is not merely local convention. Fréart's rule for the classical meander is
that returns and intersections "do always fall into right angles", quoted in the
[ICAA's article on the complex Greek meander](https://www.classicist.org/articles/classical-comments-the-complex-greek-meander/).

Invariant 5 is fixed because the intended use is **borders**. Two-dimensional field
ornament is excluded for that reason, not because it is uninteresting.

Wider-than-one-stroke gaps occur only where a band terminates, which is
[#338](https://github.com/Organizzolini/codebase/issues/338) and is not a family
property.

**The named half of the draw run runs to each family's own `FAMILY_MAXIMUM_ROWS`**, which is
the same record the command line validates against — so every drawing the command line can
be asked for is also a drawing this repository commits and the charter gates: 1,118
combinations, each family from its own structural minimum through its own ceiling. That
ceiling is the shared `MAXIMUM_VALUE` of 12 for nine of the ten families, and 6 for
`mosaic`, whose reasons are below.

It stopped at 8 until [#507](https://github.com/Organizzolini/codebase/issues/507), and that
issue lived in the four row counts between — `chain` and `snake` drew self-retracing ink at
9 through 12 rows, reachable from the command line by anybody and covered by nothing,
because the corpus stopped at 8 and the charter swept the corpus. Raising the draw run's range
to the command line's own closed the gap for both at once, which is why neither has a
maximum of its own any more. Most of the counts below moved by that change and nothing else.

**Neither permutation half followed, and `mosaic` as a whole did not either.** Both halves
stop at 6 rows, at 8,551 tiles and 208 sources. They enumerate their spaces exhaustively
rather than sampling them, and `mosaic`'s count grows about 3.4× per row — 23, 68 and 199
at rows 4 through 6, then 660, 2,229, 7,977, 29,002, 108,089 and 406,934 — so following the
other nine families to 12 would mean committing 554,891 more files. `negative`'s own growth
is about 2.4× per row — 8, 18, 40 and 93, then 216, 513, 1,218, 2,920, 7,000 and 16,850.

That cap is why the `mosaic` family stops at 6 rows everywhere rather than only in its
permutation half. A budget that applied to the enumeration alone would leave `mosaic` at 7
through 12 rows reachable from the command line and committed nowhere — which is exactly
the shape of #507. So the cap is `FAMILY_MAXIMUM_ROWS.mosaic`, the named half reads it, and
`--type mosaic --rows 7` is refused rather than drawn outside the corpus the charter gates.
`negative` keeps its ceiling of 12 as a named family; only its enumerated half stops at 6,
and its deepest row count there inverts a seven-row source that is enumerable but no longer
committed — so the corridor-identity gate covers rows 3 through 5 of that half and the
charter sweep covers the rest, exactly as it already does for the named `negative` drawings
above 6 rows.

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run meanderaw-cli:coinagerie-check:write`.

- **arcade**: A pattern characteristic for a unit with no cross or bare dot, computed by IsArcadeCharacteristicService for each unit.
- **arm**: One arm of a letter's ink, a stroke end the letter utilities count and sum through LetterUtilitiesService.reduce.
- **band**: The cyclic strip of a Code's repeating unit that characteristics read as a graph, and that drawing cuts at a width.
- **batch**: A fixed-size chunk of pattern rows that the database patterns service streams back to a caller one group at a time.
- **border**: An edge of the unit's grid, which the top and bottom border touch-count characteristics check for ink touching it.
- **br**: Bottom-right corner digit of the 2x2 window that EmbeddedUCountCharacteristicService reads when counting embedded U shapes.
- **breadth**: Callidescope's count of the direct calls a callable makes, recorded in the project's Breadth table for the gate.
- **budget**: The edge budget capping how many edges a Code may hold, which bounds enumeration and sets the corpus's fixed historical cutoff.
- **canonical**: The phase-normalized form of a Code, the lowest rotation chosen as its identity, scored by the canonical-phase scorer.
- **category**: A grouping of characteristic evaluators, each in its own service under a category folder and shown with a display name.
- **characteristic**: A measured property of a Code's repeating unit, computed by one evaluator service from a shared context and stored in the database.
- **comb**: A pattern characteristic named for a comb-shaped ink layout, computed for each unit by IsCombCharacteristicService.
- **coordinate**: A band or pixel position rounded and trimmed before drawing, as the draw index and drawing services format each path coordinate.
- **corpus**: The historical set of meander Codes ingested from the retired file tree, split by CorpusService into preserved and enumerated halves.
- **degree**: The number of ink edges meeting a point, which path and end characteristics read to find degree-one ends and degree-two runs.
- **element**: An HTML element as the draw index builds it, such as the nav sectioning element that wraps the jump list of pages.
- **enumeration**: The walk over every structurally distinct repeat a shape admits under the edge budget, implemented by EnumerationService.
- **evaluator**: A characteristic service that computes one value for a Code's unit from a shared context, registered for discovery.
- **family**: A group of related meanders, such as the waterfalls family in the historical corpus, which draw index pages gather together.
- **fork**: A point with three branches of ink, which IsForkCharacteristicService and the fork submatrix count for each unit.
- **hebrew**: The Hebrew script, whose letter shapes such as dalet get their own letter characteristics services with orientation evaluators.
- **historical**: Adjective for the retired corpus of meanders, kept as hardcoded rows and ingested by CorpusService before enumeration.
- **horizontal**: Adjective for left-to-right runs and rectangles, such as horizontal rectangle counts and the longest horizontal run length.
- **ingest**: CorpusService.ingest, which takes the historical corpus entries and writes them into the database before the draw run.
- **ink**: The inked points of a unit, the strokes a Code draws, which nearly every characteristic counts, walks, or measures.
- **lattice**: The rows-by-columns grid of points and edges that a Code spells, the structure every meander and characteristic is measured on.
- **letter**: A script glyph whose ink is characterized by a letter service with sixteen orientation evaluators, held in the letter submatrix folder.
- **meanderaw**: The project name, the NestJS CLI that draws meanders into Postgres rows, and the meanderaw web application beside it.
- **mesh**: A pattern characteristic named for a mesh of crossed strands, computed for each unit by IsMeshCharacteristicService.
- **minima**: The canonical orbit minimum of each symmetry class, which draw pool cuts into batches for worker threads to draw.
- **mirror**: A reflected orientation of a letter's base, such as its north-south mirror, that the letter characteristics module derives.
- **negative**: Adjective for a shift below zero, which the Code service reduces modulo the column span rather than refusing.
- **north**: The top side of a lattice point or unit, one of the four compass sides the Code bits and edge flags name.
- **orientation**: One of the sixteen orientation names a letter's glyph is evaluated under, such as a flip or a mirror of its base.
- **phase**: A rotation offset of a Code's repeating unit, which canonical-phase scoring compares to choose the one identity.
- **piece**: A connected piece of ink that a pattern characteristic counts, such as one branching at exactly three points in the fork check.
- **place**: A position in a Code's band or grid where a cut or read happens, such as a different cut of the same band.
- **pure**: Adjective for a tree-shaped ink unit with no loops, as IsPureTreeCharacteristicService checks, and for pure value computation.
- **quarter**: Suffix in corner keys such as Quarter and ThreeQuarter, naming a partial corner count, and also a quarter turn of a unit.
- **rectangle**: A solid block of inked points, which the rectangle submatrix characteristics count and measure across each unit.
- **reply**: A DrawWorkerReply message a draw worker posts back to the pool, handled by DrawPoolService when a batch finishes or fails.
- **representative**: The canonical member standing for a symmetry class, from which the draw worker builds the class and its stored Code.
- **rotation**: A column shift of a Code's repeating unit, one of the phases that canonical-phase scoring compares to pick an identity.
- **south**: The bottom side of a lattice point or unit, one of the four compass sides the Code bits and edge flags name.
- **square**: Adjective for a square-shaped unit or wave in the test fixtures, such as a square wave whose turns the inflection test counts.
- **stem**: The part of a letter service class name before its script suffix, which the letter module test extracts with a named regex group.
- **strand**: A maximal run of ink through degree-two points, which StrandUtilitiesService cuts out of a repeat for the strand characteristics.
- **submatrix**: A folder of characteristic evaluators that read one sub-window of a Code's unit, such as point, letter, corner, or rectangle.
- **swirl**: A pattern characteristic for a unit whose strands wind one way, computed by IsSwirlCharacteristicService for each Code.
- **tian**: Romanized name of a Hanzi glyph whose orientations get a letter characteristics service class with sixteen evaluators.
- **tile**: A square cell of the lattice with its four direction bits, handled by TileService and TileCrossingCharacteristicsModule.
- **trace**: A callidescope trace, the call-stack walk the gate measures, or a motif trace that path-data test helpers split out of a unit.
- **tu**: Romanized name of a Hanzi glyph whose orientations get a letter characteristics service class with sixteen evaluators.
- **updatable**: Stray fragment with no source hit, so the glossary lists it without any meanderaw concept behind it.
- **waterfall**: A pattern characteristic named for a waterfall of stacked strands, computed by IsWaterfallsCharacteristicService for each unit.
- **whirl**: A pattern characteristic for a unit whose strands wind in a whirl, computed by IsWhirlCharacteristicService for each Code.

<!-- coinagerie:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-45802-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-2.29_MB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-36-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-440-3178c6?style=flat-square)

### Measured Targets

![Compiled JavaScript Size](https://img.shields.io/badge/Compiled_JavaScript_Size-242.86_kB_gzip-6b7280?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-440-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-50-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-7-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-475-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-858-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-179-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-19-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-204-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-2529-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-545-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-2591-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-483-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-1329-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-2590-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-342-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-1638-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-4901-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-0-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-0-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-0-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-0-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-0-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-4-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-177-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-49-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-15-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-116-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-87-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-9-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-41-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-161-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-7-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-0-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-0-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-0-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-0-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-0-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-0-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-0-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-0-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-0-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-0-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-0-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-0-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-0-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-0-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-0-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-0-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-0-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-4-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-107-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-29-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-0-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-1-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-7-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-2-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-0-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-0-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-0-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-0-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-0-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-0-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-0-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-0-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-0-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-0-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-0-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-0-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-0-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-0-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-0-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-33-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-157-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-1-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-29-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-20-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-1-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-167-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-11-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-1-0284c7?style=flat-square)
![CSS Comment Budget](https://img.shields.io/badge/CSS_Comment_Budget-0-16a34a?style=flat-square)
![HCL Comment Budget](https://img.shields.io/badge/HCL_Comment_Budget-0-ea580c?style=flat-square)
![Python Comment Budget](https://img.shields.io/badge/Python_Comment_Budget-0-db2777?style=flat-square)
![SQL Comment Budget](https://img.shields.io/badge/SQL_Comment_Budget-0-0ea5e9?style=flat-square)
![TOML Comment Budget](https://img.shields.io/badge/TOML_Comment_Budget-0-059669?style=flat-square)
![TypeScript Comment Budget](https://img.shields.io/badge/TypeScript_Comment_Budget-0-ca8a04?style=flat-square)
![YAML Comment Budget](https://img.shields.io/badge/YAML_Comment_Budget-0-7c3aed?style=flat-square)
![Shell Comment Budget](https://img.shields.io/badge/Shell_Comment_Budget-0-0284c7?style=flat-square)

### Jupyter

![Notebooks](https://img.shields.io/badge/Notebooks-0-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-0-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-0-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-0-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-0-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-0-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-0-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-0-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-0-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-0-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-0-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-0-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-0-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-0-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-3-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-5605-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-10-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-22-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-191-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-8-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-33-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-6-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-388-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-20-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-130-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-1685-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
