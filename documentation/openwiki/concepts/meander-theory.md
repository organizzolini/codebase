---
type: "Reference"
title: "Meander Theory"
description: "Documents the mathematical/mechanical model behind meanderaw's pattern generation: the lattice address system (Code, rows, columns), the crossing/interlace mechanics, the band/parallel/branch structure, and how characteristics are computed from the Code."
tags: ["meanderaw", "theory", "lattice", "characteristics", "code", "canonical-phase"]
sources:
  - id: openwiki-source-39c3295efc089133e87a9c80
    resource: repo://CONTEXT.md
  - id: openwiki-source-621df1109a69de22d302b154
    resource: repo://documentation/adr/0004-draw-crossings-as-a-one-pitch-interlace-break.md
  - id: openwiki-source-289a207fba46f04c1857f68b
    resource: repo://documentation/adr/0006-close-both-band-borders-in-branch-and-parallel.md
  - id: openwiki-source-7878d6ae84c1692fb451e0db
    resource: repo://documentation/adr/0007-address-every-meander-by-its-lattice.md
  - id: openwiki-source-f06ea58f0c5e89bd4694952c
    resource: repo://documentation/adr/0014-give-every-meander-a-canonical-phase.md
  - id: openwiki-source-fab4198bacef6ed4faa83df5
    resource: repo://documentation/adr/0015-store-families-as-an-open-multi-label-set.md
  - id: openwiki-source-f24a774e35f681409d751e76
    resource: repo://documentation/adr/0023-filter-meanders-by-characteristics-alone.md
  - id: openwiki-source-d8f4b3f15cd18fc729f7df07
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.constants.ts
  - id: openwiki-source-241f1898b527647f88d7490f
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.types.ts
  - id: openwiki-source-680fe4c6e442413e1fa1bb49
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-chain-characteristic.service.ts
  - id: openwiki-source-9a879298f467b9d5afe12d1e
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/tile-crossing/tile-crossing-component-delta-count-characteristic.service.ts
  - id: openwiki-source-690b47e95bf304afb3c612a0
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/tile-crossing/tile-crossing-count-characteristic.service.ts
  - id: openwiki-source-ee25d9a7efc2a7aae7125bbe
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/tile-crossing/tile-crossing-cycle-count-characteristic.service.ts
  - id: openwiki-source-4c85eface01cd2a486ef3cd1
    resource: repo://projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---
# Meander Theory

This page establishes the canonical vocabulary and structural theory for the meander domain. Every term is grounded in implementation across `meanderaw-cli` and its ADRs.

---

## Core Concepts

### Meander

> **Meander**: A single generated Greek key/fret ornament — a band of ink drawn from a Code, rendered as one SVG document.
> _Avoid_: Pattern, motif, key pattern

A meander is not a family, a style, or a classification. It is exactly one generated band of ink, completely determined by its Code, row count, and column count. Two meanders with the same Code at the same dimensions are the same meander; there is no hidden state.

### Code

> **Code**: The direction bits that are a meander: one hexadecimal digit per interior lattice point of one true repeat, read row-major and worth `8` north, `4` south, `2` east and `1` west. A meander is its Code — nothing else identifies it, and nothing about how it is drawn, measured, or named is stored separately from it.
> _Avoid_: Lattice address, hash, fingerprint

The Code is a **row-major string of hexadecimal digits**. Each digit encodes four direction bits at one interior lattice point:

| Bit | Value | Direction |
|-----|-------|-----------|
| 8   | 0b1000 | North    |
| 4   | 0b0100 | South    |
| 2   | 0b0010 | East     |
| 1   | 0b0001 | West     |

For example, the digit `5` (0b0101) means ink goes south and west; `c` (0b1100) means north and south (a vertical straight); `0` means no ink at that point (a dot).

The Code format in storage is `{columns}x{rows}y{digits}` (e.g., `02x02y4488`), with an optional `r{repeats}` suffix. The bare hexadecimal digits alone are the `lattice` column.

**Key properties:**

- **Read in place**: Every bit is decoded literally off its own digit at index `row * columns + column` — no re-derivation from neighbors.
- **Deliberately redundant**: Four bits per point describes `4 * columns * rows` bits where the tile has only `columns * (2 * rows - 1)` degrees of freedom, because every edge is written twice (once at each end). This redundancy is checked by `TileService.assertWellFormed`.
- **Self-contained**: A Code string carries its own dimensions; no external metadata is needed to decode it.

### Tile

> **Tile**: One repeat unit's worth of the lattice a meander is drawn on — the grid of points and edges a Code is spelled into.
> _Avoid_: Cell, unit, permutation

The tile is the decoded grid (`Matrix`) of `MatrixPoint` objects, each with four boolean directions. It is the runtime representation that characteristics and the renderer walk. A Code *spells into* a tile; a tile *spells back* to a Code (canonically, via `CodeService.spellCanonical`).

### Rows, Grid Unit, Channel

> **Rows**: The parameter that sets a meander's grid density. It does not change the canvas height, which stays fixed; instead it divides that fixed height into finer subdivisions, shrinking the grid unit and stroke width as rows increases.
> _Avoid_: Row count, height, N

> **Grid unit**: The base spacing a meander's coordinates are built from, derived from canvas height divided by rows. Stroke width and offsets are themselves derived from the grid unit, not set independently.
> _Avoid_: Cell size, spacing, step

> **Channel**: The white space separating two neighboring strokes. Exactly one stroke width wide everywhere inside a band, which is what makes a meander space-filling.
> _Avoid_: Gap, whitespace, margin

The channel invariant (invariant 2) is measured as `channelWidthCompliant` by the charter test. **ADR 0004** shows how the `cross` family's `interrupted` mode breaks the under-strand by exactly one grid pitch either side of a junction, leaving a gap of exactly one stroke width — the same width as every other channel — keeping invariant 2 intact while relaxing invariant 4 (no X-junctions).

---

## Phase and Canonical Phase

### Phase

> **Phase**: Which cyclic rotation of a Code's columns is the one stored and drawn. The same band cut at a different column is the same meander in a different phase, so a meander has exactly one canonical phase rather than one Code.
> _Avoid_: Rotation, offset, cut

A cyclic column rotation of a Code represents the same infinite band cut at a different column. For a Code with `C` columns, there are `C` possible phases.

### Canonical Phase Selection

**ADR 0014** defines the canonical phase as:

> The rotation (under the column-translation group) that minimizes `seamComponents`, breaking ties by choosing the lexicographically smallest Code.

`seamComponents` (now measured as `tileCrossingComponentDeltaCount`) is the number of connected components the tile boundary merges — pieces that are separate within one lone tile but join once the tile repeats. Minimizing this is exactly "the cut that strands the fewest fragments."

The group of transformations defaults to cyclic column rotation but is parameterized, allowing future transformation sets (e.g., including horizontal flips) to change which meanders count as the same one.

**Implementation**: `CodeService.canonicalPhase` evaluates every phase in the group, scores each via `TileCrossingComponentDeltaCountCharacteristicService`, and picks the minimum (tie-breaking lexicographically).

---

## Tile Crossing

> **Tile crossing**: The join where a tile's last column meets its first when a Code is read as a repeating band rather than as a finite drawing. What crosses it — a stranded end, a junction, a closed loop — is measured rather than assumed, and the measurement is what a canonical phase is chosen to minimize.
> _Avoid_: Seam (formerly this project's own term), wrap, edge, border

When a tile repeats, edges leaving the last column wrap to the first column. The **tile crossing** is the set of these wrapping edges. What crosses this boundary is not assumed from the Code's digits — it is measured by comparing the graph of the cyclic band against the graph of the lone tile (with wrapping disabled).

Three characteristic services measure the tile crossing:

| Characteristic | What it measures | Formula |
|----------------|------------------|---------|
| `tileCrossingCount` | Edges that cross the boundary | \|E_band\| - \|E_tile\| |
| `tileCrossingCycleCount` | Loops that close only by wrapping | b₁(G_band) - b₁(G_tile) |
| `tileCrossingComponentDeltaCount` | Components merged by wrapping | b₀(G_tile) - b₀(G_band) |

These replace the retired `crossesTheSeam`, `seamCycles`, and `seamComponents` flags. They are **path-tier** characteristics (walk the ink as a graph over the cyclic band).

---

## Crossing / Interlace Mechanics

### One-Pitch Interlace Break (ADR 0004)

The `cross` family draws the complex Greek meander with interlaced crossings. To satisfy the charter invariants:
- **Invariant 2**: Every interior white channel is exactly one stroke width.
- **Invariant 4**: Ink contains no X-junctions (relaxed in `interrupted` mode).

The solution: **break the under-strand by exactly one grid pitch either side of the junction**. This leaves a gap of exactly one stroke width (satisfying invariant 2), and removes the X-junction from the ink graph (the crossing drops from degree 4 to degree 2).

Key consequences:
- **No ink X-junctions in interrupted mode**: Solid mode reports `inkXJunctions: 12` at 6 repeats; interrupted reports `0`.
- **Invariant 2 is not relaxed**: The break gives up a grid edge, never a lattice point.
- **Interlace reads from continuation, not gap width**: The broken strand resumes in line on the far side — a weaker visual signal than ink of two weights, but preserves the flat path model (invariant 6).
- **Minimum 6 rows for cross family**: Below 6 rows the upper remnant collapses to a zero-length run.

### Band Borders in Branch and Parallel (ADR 0006)

Both `branch` and `parallel` families now close the band at **top and bottom** in every mode, using the optional `MotifService.border` hook `boxes`.

- **Branch**: The figure is **inset by one lattice row** from each rule beside it, so a rule closes the band without landing on the ink. This preserves the crenellation and free ends.
- **Parallel**: Starts branching (relaxes no-branching invariant) under a structural condition — a rule meets a strand's rising end with west, east, and south ink at one lattice point.

The correction from the initial implementation (which ruled borders onto the figure) fixed two problems: branch modes collapsing to one picture, and branch incorrectly being recorded as having given up being acyclic.

---

## Characteristics

### Characteristic

> **Characteristic**: A measured structural property of a meander, read as a pattern over the Code's digits where one exists and by walking the tile where none does. Characteristics are an open, growing set — adding one changes no other module.
> _Avoid_: Property, metric, trait

Characteristics are the **only** way meanders are queried, filtered, and understood. They are:

- **Measured, not assigned**: Computed from the Code/tile at draw time.
- **Open set**: New characteristics are added by registering an evaluator; no schema migration, no classifier rewrite.
- **Typed**: Each yields a boolean, number, or (for letter groups) sixteen orientation counts.
- **Tiered**:
  - **submatrix** — reads local windows of the grid (single point or M×N sliding window)
  - **path** — walks the ink as a graph over the cyclic band
  - **compound** — combines other characteristics' values rather than reading the grid itself

Every characteristic is a self-describing service (`CharacteristicEvaluator`) with metadata: `key`, `name`, `description`, `formula` (LaTeX), `category`, `valueType`. Evaluators share a `CharacteristicContext` (code, rows, columns, matrix) prepared once per meander.

### Pattern Characteristic

> **Pattern characteristic**: A compound boolean Characteristic built only from other Characteristics — a named shape such as a whirl or an arcade. A meander can hold several at once, or none; it is found by filtering on them, never by a stored label.
> _Avoid_: Family, style, kind, category, classification

**ADR 0023** eliminated the single-family enum column. Former families are now **pattern characteristics** — compound booleans under `compound/pattern/` built only from other characteristics.

The current pattern characteristics (alphabetical):

- `isArcade`
- `isBars`
- `isBoxes`
- `isChain`
- `isClasps`
- `isComb`
- `isCross`
- `isDots`
- `isDoubleChain`
- `isFork`
- `isLines`
- `isMesh`
- `isParallel`
- `isPureTree`
- `isSnake`
- `isSwirl`
- `isWaterfalls`
- `isWhirl`

Each is a `CharacteristicEvaluator<boolean>` in `compound/pattern/` that injects and calls other evaluators. For example, `isChain` checks:

```
maxMonotonicTurnLength - tightestTurnCount ≥ 4  ∧  tileCrossingComponentDeltaCount = 1
```

A meander can satisfy multiple pattern characteristics simultaneously, or none. The draw run writes one HTML page per pattern characteristic (`output/patterns/<key>.html`), listing every meander it holds for.

---

## Lattice Address System

**ADR 0007** establishes that every meander carries a **lattice address** — `<rows>r<columns>c-` followed by one hexadecimal character per interior lattice point, worth `8` north, `4` south, `2` east and `1` west, spanning one true repeat — read off the rendered document rather than off the generator, with its canonical symmetry class reported beside it.

Key properties:
- **9,877 committed drawings address**, enabling cross-family comparison: 149 combinations of row count, span, and canonical class are drawn by more than one family.
- **Address at the true repeat**, not the family's pitch. The span is a whole number of pitches, declared per modifier in `MODIFIER_REPEAT_PITCHES`.
- **67 expected address collisions** are documented where the address cannot distinguish drawings (e.g., two-row bands have no addressable vertical edges; dotting differences are not encoded).
- **Sub-family naming**: `MosaicNamingService.rules` (pure structure over a tile) now answers for readings from any family — 85 of 1,118 swept combinations earn a name (10 in branch, 25 in negative, 50 in parallel).

---

## Families as Open Multi-Label Set (ADR 0015, superseded by 0023)

Historically, each meander was filed under exactly one architectural family (`whirl`, `box`, `snake`, etc.), encoded as a single `family` column with an enum constraint. This was fundamentally flawed:
- Overlapping definitions caused thousands of enumerated meanders to genuinely qualify as both `boxes` and `chain`, but the schema forced an arbitrary tie-break order.
- Hardcoded rules tightly binding grids to characteristics proved fragile.

**ADR 0015** dropped the single-family constraint, storing `families` and boolean `characteristics` as open string arrays. A meander earns a set of families rather than exactly one. The `drawingHash` (SHA-256) replaced the stored SVG column as a drift guard.

**ADR 0023** superseded this by eliminating families entirely — former families are now pattern characteristics (compound booleans), and filtering is by characteristics alone.

---

## Mermaid Diagram: Code → Lattice → Tile → Crossings → Canonical Phase

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: an unescaped angle bracket inside a label breaks rendering; rephrase the label. -->
```text
flowchart TD
    A[Code String<br/>02x02y4488] -->|parse| B[CodeObject<br/>{columns, rows, digits, repeats}]
    B -->|spellDigits| C[Tile / Matrix<br/>rows x columns of MatrixPoint]
    C -->|connectivity<br/>unwrapped=false| D[Cyclic Band Graph<br/>edges wrap east]
    C -->|connectivity<br/>unwrapped=true| E[Lone Tile Graph<br/>no east wrap]
    D --> F[tileCrossingCount<br/>edges added by wrap]
    D --> G[tileCrossingCycleCount<br/>loops added by wrap]
    E --> H[tileCrossingComponentDeltaCount<br/>components merged by wrap]
    F --> I[Canonical Phase Selection]
    G --> I
    H --> I
    I -->|minimize deltaCount<br/>tie-break lexicographically| J[Canonical CodeObject]
    J -->|format| K[Canonical Code String]
    K --> L[Stored in DB<br/>drawn as SVG]
```

**Caption**: From Code string through tile decoding, cyclic vs. lone-tile graph comparison, tile-crossing measurements, to canonical phase selection and storage.

---

## ADR References

| ADR | Title | Concept |
|-----|-------|---------|
| 0004 | Draw an interrupted crossing as a one-pitch interlace break | Channel invariant, tile crossing measurement, `cross` family |
| 0006 | Close both band borders in branch and parallel | Band border rules, figure inset, branching condition |
| 0007 | Address every meander by its lattice | Lattice address format, true repeat vs pitch, cross-family comparison |
| 0014 | Give Every Meander a Canonical Phase | Canonical phase definition, `seamComponents` → `tileCrossingComponentDeltaCount` |
| 0015 | Store Families as an Open Multi-Label Set | Superseded by 0023; introduced open boolean characteristics |
| 0018 | Store Every Characteristic in One Sparse JSON Map | Supersedes 0015's boolean array; single `characteristics` JSON column |
| 0019 | Drop the Drift Check and the Drawing Hash | Supersedes 0015's `drawingHash`; drawing is a pure function of Code |
| 0020 | Store Meanders in Postgres | Database storage of Code + characteristics |
| 0021 | Stop Committing the Meander Pages | Output pages are gitignored, streamed per pattern |
| 0023 | Filter Meanders by Characteristics Alone | Eliminates families; pattern characteristics as compound booleans |

---

## Related Concepts

- [Generator, Template, Instance, Language](../concepts/generator-template-instance.md) — Conformetry vocabulary (meanderaw uses conformetry for its own configuration)
- [Meanderaw Domain](../domain/meanderaw.md) — Project overview and architecture
- [Meanderaw Testing](../testing/meanderaw.md) — Charter tests, lattice/service tests, integration assertions
