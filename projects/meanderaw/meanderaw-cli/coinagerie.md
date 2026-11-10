<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

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
