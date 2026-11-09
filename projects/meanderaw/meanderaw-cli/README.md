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
