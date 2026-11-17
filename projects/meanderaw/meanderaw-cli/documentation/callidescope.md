<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/meanderaw/meanderaw-cli`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 819 |
| Files | 252 |
| Calls traced | 700 |
| Call stacks | 112 |
| Deepest stack | 16 |
| Stacks through recursion | 0 |
| Unfollowable calls | 25 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 16 |
| `maximumBreadth` | 14 |

### Call stacks (depth)

**1. `DrawCommand.run`** — depth ≥ 16 · decorated-method

```text
🚀 DrawCommand.run(_passedParameters: string[], options: DrawCommandOptions): Promise<void> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:218]
   ↳ Draws every meander into the database when no Code is named, or draws the one `--code` names.
  └─> DrawCommand.drawAll(): Promise<void> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:109]
     ↳ Draws every meander the application can draw, as rows in the local database.
    └─> DrawEnumerationService.drawAll(): Promise<number> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-enumeration.service.ts:45]
       ↳ Every shape the budget admits, drawn and written — which is what `draw` with no drawing named now does.
      └─> DrawEnumerationService.persist(shapes: readonly MeanderShape[]): Promise<number> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-enumeration.service.ts:67]
         ↳ Draws the shapes named and writes every meander they hold, a batch of rows at a time as the pool hands them back,…
        └─> DrawPoolService.batches(shape: MeanderShape): AsyncGenerator<readonly MeanderRecord[]> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:186]
           ↳ Every meander of one shape as the rows the database holds for them, a batch at a time, one per symmetry class, in the…
          └─> DrawWorkerService.records(shape: MeanderShape, masks: readonly number[]): MeanderRecord[] [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-worker.service.ts:48]
             ↳ Every mask's meander as an enumerated row, in the order the masks were given.
            └─> DrawWorkerService.map(…)(mask: number): MeanderRecord [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-worker.service.ts:49]
              └─> DrawRecordService.record(…): MeanderRecord [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-record.service.ts:45]
                 ↳ The row one Code describes at one shape, every field of it derived from that Code alone.
                └─> CharacteristicsService.compute(code: Code | CodeObject): Characteristics [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:219]
                   ↳ Every characteristic of a Code's repeating unit, computed by every evaluator from one shared context.
                  └─> CharacteristicContextService.create(code: Code | CodeObject): CharacteristicContext [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:66]
                     ↳ Builds the context for the repeating unit of a formatted Code string or an already parsed Code.
                    └─> CharacteristicContextService.build(code: CodeObject): CharacteristicContext [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:39]
                       ↳ Builds the context for exactly the Code given, with its digits re-spelled from its decoded matrix.
                      └─> MatrixService.fromCode(code: Code | CodeObject, rows?: number, columns?: number): Matrix [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:65]
                         ↳ Converts a meander Code string (self-contained formatted or bare hexadecimal digits with dimensions) or a `CodeObject`…
                        └─> CodeService.parse(code: Code, rows?: number, columns?: number): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:215]
                           ↳ Reads `code`, either as a self-contained string formatted as `{columns}x{rows}y{digits}r{repeats}` or as bare…
                          └─> CodeService.parseFormatted(match: RegExpExecArray): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:102]
                             ↳ Parses a self-contained code string match into a `CodeObject`.
                            └─> CodeService.validateDigits(digits: string, rows: number, columns: number): void [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:125]
                               ↳ Validates that digits match expected length for the shape and are valid hexadecimal.
                              └─> InvalidCodeLengthError.constructor(code: string, rows: number, columns: number): InvalidCodeLengthError [projects/meanderaw/meanderaw-cli/src/modules/code/code.constants.ts:50]
```

**2. `AinArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 AinArabicLetterCharacteristicsService.constructor(…): AinArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/ain-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**3. `AlefArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 AlefArabicLetterCharacteristicsService.constructor(…): AlefArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/alef-arabic-letter-characteristics.service.ts:22]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

<details>
<summary>109 more call stacks</summary>

**4. `BehArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 BehArabicLetterCharacteristicsService.constructor(…): BehArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/beh-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**5. `DalArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 DalArabicLetterCharacteristicsService.constructor(…): DalArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/dal-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**6. `FehArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 FehArabicLetterCharacteristicsService.constructor(…): FehArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/feh-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**7. `HahArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 HahArabicLetterCharacteristicsService.constructor(…): HahArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/hah-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**8. `HehArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 HehArabicLetterCharacteristicsService.constructor(…): HehArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/heh-arabic-letter-characteristics.service.ts:23]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**9. `KafArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 KafArabicLetterCharacteristicsService.constructor(…): KafArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/kaf-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**10. `LamArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 LamArabicLetterCharacteristicsService.constructor(…): LamArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/lam-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**11. `MeemArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 MeemArabicLetterCharacteristicsService.constructor(…): MeemArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/meem-arabic-letter-characteristics.service.ts:23]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**12. `NoonArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 NoonArabicLetterCharacteristicsService.constructor(…): NoonArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/noon-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**13. `QafArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 QafArabicLetterCharacteristicsService.constructor(…): QafArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/qaf-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**14. `RehArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 RehArabicLetterCharacteristicsService.constructor(…): RehArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/reh-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**15. `SadArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 SadArabicLetterCharacteristicsService.constructor(…): SadArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/sad-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**16. `SeenArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 SeenArabicLetterCharacteristicsService.constructor(…): SeenArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/seen-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**17. `TahArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 TahArabicLetterCharacteristicsService.constructor(…): TahArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/tah-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**18. `WawArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 WawArabicLetterCharacteristicsService.constructor(…): WawArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/waw-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**19. `YehArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 YehArabicLetterCharacteristicsService.constructor(…): YehArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/yeh-arabic-letter-characteristics.service.ts:21]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349]
     ↳ The evaluators of a letter drawn as several base templates — an Arabic letter's positional forms — each form's sixteen…
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
         ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
           ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                     ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                           ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**20. `bootstrap`** — depth ≥ 13 · orphan-root

```text
🚀 bootstrap(): Promise<void> [projects/meanderaw/meanderaw-cli/src/worker.ts:24]
   ↳ The entry point of one draw run worker thread, spawned by `DrawPoolService`: boots `DrawWorkerModule` once, then draws…
  └─> on(…)(task: DrawWorkerTask): void [projects/meanderaw/meanderaw-cli/src/worker.ts:36]
    └─> DrawWorkerService.records(shape: MeanderShape, masks: readonly number[]): MeanderRecord[] [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-worker.service.ts:48]
       ↳ Every mask's meander as an enumerated row, in the order the masks were given.
      └─> DrawWorkerService.map(…)(mask: number): MeanderRecord [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-worker.service.ts:49]
        └─> DrawRecordService.record(…): MeanderRecord [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-record.service.ts:45]
           ↳ The row one Code describes at one shape, every field of it derived from that Code alone.
          └─> CharacteristicsService.compute(code: Code | CodeObject): Characteristics [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:219]
             ↳ Every characteristic of a Code's repeating unit, computed by every evaluator from one shared context.
            └─> CharacteristicContextService.create(code: Code | CodeObject): CharacteristicContext [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:66]
               ↳ Builds the context for the repeating unit of a formatted Code string or an already parsed Code.
              └─> CharacteristicContextService.build(code: CodeObject): CharacteristicContext [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:39]
                 ↳ Builds the context for exactly the Code given, with its digits re-spelled from its decoded matrix.
                └─> MatrixService.fromCode(code: Code | CodeObject, rows?: number, columns?: number): Matrix [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:65]
                   ↳ Converts a meander Code string (self-contained formatted or bare hexadecimal digits with dimensions) or a `CodeObject`…
                  └─> CodeService.parse(code: Code, rows?: number, columns?: number): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:215]
                     ↳ Reads `code`, either as a self-contained string formatted as `{columns}x{rows}y{digits}r{repeats}` or as bare…
                    └─> CodeService.parseFormatted(match: RegExpExecArray): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:102]
                       ↳ Parses a self-contained code string match into a `CodeObject`.
                      └─> CodeService.validateDigits(digits: string, rows: number, columns: number): void [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:125]
                         ↳ Validates that digits match expected length for the shape and are valid hexadecimal.
                        └─> InvalidCodeLengthError.constructor(code: string, rows: number, columns: number): InvalidCodeLengthError [projects/meanderaw/meanderaw-cli/src/modules/code/code.constants.ts:50]
```

**21. `ALatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ALatinLetterCharacteristicsService.constructor(…): ALatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/a-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**22. `AoHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 AoHanziLetterCharacteristicsService.constructor(…): AoHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/ao-hanzi-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**23. `BLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 BLatinLetterCharacteristicsService.constructor(…): BLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/b-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**24. `CLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 CLatinLetterCharacteristicsService.constructor(…): CLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/c-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**25. `DaletHebrewLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 DaletHebrewLetterCharacteristicsService.constructor(…): DaletHebrewLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/dalet-hebrew-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**26. `DeltaGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 DeltaGreekLetterCharacteristicsService.constructor(…): DeltaGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/delta-greek-letter-characteristics.service.ts:28]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**27. `ELatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ELatinLetterCharacteristicsService.constructor(…): ELatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/e-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**28. `FLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 FLatinLetterCharacteristicsService.constructor(…): FLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/f-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**29. `GanHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 GanHanziLetterCharacteristicsService.constructor(…): GanHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/gan-hanzi-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**30. `HLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 HLatinLetterCharacteristicsService.constructor(…): HLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/h-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**31. `ILatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ILatinLetterCharacteristicsService.constructor(…): ILatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/i-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**32. `JiaHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 JiaHanziLetterCharacteristicsService.constructor(…): JiaHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/jia-hanzi-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**33. `JingHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 JingHanziLetterCharacteristicsService.constructor(…): JingHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/jing-hanzi-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**34. `KappaGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 KappaGreekLetterCharacteristicsService.constructor(…): KappaGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/kappa-greek-letter-characteristics.service.ts:29]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**35. `KieukHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 KieukHangulLetterCharacteristicsService.constructor(…): KieukHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/kieuk-hangul-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**36. `LLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 LLatinLetterCharacteristicsService.constructor(…): LLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/l-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**37. `LambdaGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 LambdaGreekLetterCharacteristicsService.constructor(…): LambdaGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/lambda-greek-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**38. `LamedHebrewLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 LamedHebrewLetterCharacteristicsService.constructor(…): LamedHebrewLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/lamed-hebrew-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**39. `MLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 MLatinLetterCharacteristicsService.constructor(…): MLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/m-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**40. `MuHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 MuHanziLetterCharacteristicsService.constructor(…): MuHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/mu-hanzi-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**41. `NLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 NLatinLetterCharacteristicsService.constructor(…): NLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/n-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**42. `OLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 OLatinLetterCharacteristicsService.constructor(…): OLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/o-latin-letter-characteristics.service.ts:24]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**43. `OmegaGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 OmegaGreekLetterCharacteristicsService.constructor(…): OmegaGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/omega-greek-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**44. `PhiGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 PhiGreekLetterCharacteristicsService.constructor(…): PhiGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/phi-greek-letter-characteristics.service.ts:28]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**45. `PieupHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 PieupHangulLetterCharacteristicsService.constructor(…): PieupHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/pieup-hangul-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**46. `PsiGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 PsiGreekLetterCharacteristicsService.constructor(…): PsiGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/psi-greek-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**47. `RhoGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 RhoGreekLetterCharacteristicsService.constructor(…): RhoGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/rho-greek-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**48. `SLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 SLatinLetterCharacteristicsService.constructor(…): SLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/s-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**49. `ShangHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ShangHanziLetterCharacteristicsService.constructor(…): ShangHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/shang-hanzi-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**50. `ShenHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ShenHanziLetterCharacteristicsService.constructor(…): ShenHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/shen-hanzi-letter-characteristics.service.ts:28]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**51. `SigmaGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 SigmaGreekLetterCharacteristicsService.constructor(…): SigmaGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/sigma-greek-letter-characteristics.service.ts:28]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**52. `TLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 TLatinLetterCharacteristicsService.constructor(…): TLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/t-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**53. `TavHebrewLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 TavHebrewLetterCharacteristicsService.constructor(…): TavHebrewLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/tav-hebrew-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**54. `TianHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 TianHanziLetterCharacteristicsService.constructor(…): TianHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/tian-hanzi-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**55. `TuHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 TuHanziLetterCharacteristicsService.constructor(…): TuHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/tu-hanzi-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**56. `TuSoilHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 TuSoilHanziLetterCharacteristicsService.constructor(…): TuSoilHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/tu-soil-hanzi-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**57. `ULatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ULatinLetterCharacteristicsService.constructor(…): ULatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/u-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**58. `WLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 WLatinLetterCharacteristicsService.constructor(…): WLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/w-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**59. `WangHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 WangHanziLetterCharacteristicsService.constructor(…): WangHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/wang-hanzi-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**60. `XLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 XLatinLetterCharacteristicsService.constructor(…): XLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/x-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**61. `YLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YLatinLetterCharacteristicsService.constructor(…): YLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/y-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**62. `YaHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YaHangulLetterCharacteristicsService.constructor(…): YaHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/ya-hangul-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**63. `YeoHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YeoHangulLetterCharacteristicsService.constructor(…): YeoHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/yeo-hangul-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**64. `YoHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YoHangulLetterCharacteristicsService.constructor(…): YoHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/yo-hangul-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**65. `YouHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YouHanziLetterCharacteristicsService.constructor(…): YouHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/you-hanzi-letter-characteristics.service.ts:27]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**66. `YuHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YuHangulLetterCharacteristicsService.constructor(…): YuHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/yu-hangul-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**67. `YuKatakanaLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YuKatakanaLetterCharacteristicsService.constructor(…): YuKatakanaLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/yu-katakana-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**68. `ZLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ZLatinLetterCharacteristicsService.constructor(…): ZLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/z-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288]
     ↳ A letter's sixteen evaluators, one per orientation in {@link LetterUtilitiesService.orientationNames} order.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374]
       ↳ A base template drawn in all sixteen orientations, in {@link LetterUtilitiesService.orientationNames} order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262]
                 ↳ Turns a template one quarter clockwise: its west column becomes its top row, and each arm moves round — north to east,…
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192]
                       ↳ Rewrites a template digit's arms through `arms`, which maps each arm bit — north 8, south 4, east 2, west 1 — to the…
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:203]
```

**69. `EnumerationService.enumerate`** — depth ≥ 11 · orphan-root

```text
🚀 EnumerationService.enumerate(shape: MeanderShape): EnumeratedMeander[] [projects/meanderaw/meanderaw-cli/src/modules/enumeration/enumeration.service.ts:98]
   ↳ Every structurally distinct meander of one shape, one per symmetry class, each spelled by the Code of the class's own…
  └─> TileEnumerationService.enumerate(rows: number, columns: number): Tile[] [projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:165]
     ↳ Every distinct tile of the given size, one per symmetry class, ordered by canonical edge key so the draw run is stable…
    └─> TileEnumerationService.map(…)(mask: number): { key: string; tile: Tile; } [projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:179]
      └─> SymmetryService.canonicalTile(tile: Tile): Tile [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:206]
         ↳ The one tile of a symmetry class the corpus draws.
        └─> SymmetryService.orbit(tile: Tile): Tile[] [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:106]
           ↳ Every tile the symmetry group maps `tile` to, itself included, with duplicates left in.
          └─> SymmetryService.map(…)(element: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:107]
            └─> SymmetryService.transform(tile: Tile, options: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:177]
               ↳ The tile one group element maps `tile` to.
              └─> TileService.blankEdges(shape: TileShape): EdgesDraft [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:143]
                 ↳ A tile's worth of unset edges, ready to be marked one at a time and handed to {@link build}.
                └─> TileService.grid(rowCount: number): boolean[][] [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:145]
                  └─> TileService.from(…)(): boolean[] [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:146]
                    └─> TileService.from(…)(): boolean [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:147]
```

**70. `DrawIndexService.render`** — depth ≥ 11 · orphan-root

```text
🚀 DrawIndexService.render(meanders: readonly Meander[]): Promise<Record<string, string>> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:363]
   ↳ The same pages from rows already in memory, each read into one string — the seam a test renders a handful of meanders…
  └─> DrawIndexService.pages(source: MeanderPageSource): Record<string, MeanderPageContent> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:183]
     ↳ Every page `source`'s rows make, each produced lazily as it is read.
    └─> DrawIndexService.patternPage(…): AsyncGenerator<string, any, any> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:213]
       ↳ One pattern's page: every meander it holds for, one grid per shape, a batch of rows at a time.
      └─> DrawIndexService.shapeSections(…): AsyncGenerator<string, any, any> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:301]
         ↳ A pattern's one section: one grid per shape, each with its own count.
        └─> DrawIndexService.renderFigure(meander: Meander): string [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:264]
           ↳ Renders one meander's own figure: the band its tile repeats into, and its caption.
          └─> DrawIndexService.renderBand(meander: Meander): string [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:244]
             ↳ Lays one row's tile out along a band of `BAND_REPEAT_COUNT` repeats.
            └─> DrawingService.render(code: CodeObject): string [projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:125]
               ↳ Renders a Code to a complete SVG document: `rows` grid units tall — the same fixed canvas height every Code draws…
              └─> DrawingService.codeSegments(geometry: Geometry, code: CodeObject): string [projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:54]
                 ↳ The path data every point of the Code draws, in reading order.
                └─> DrawingService.pointSegments(geometry: Geometry, point: Directions, origin: CanvasPoint): string [projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:95]
                   ↳ The path data one point draws: the edges it owns, or a dot where it owns none.
                  └─> DrawingService.format(value: number): string [projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:85]
                     ↳ Rounds and trims one pixel coordinate for interpolation into path data.
                    └─> GeometryService.formatCoordinate(value: number): string [projects/meanderaw/meanderaw-cli/src/modules/geometry/geometry.service.ts:62]
                       ↳ Rounds a coordinate to five decimal places and trims any trailing zeros.
```

**71. `CodeService.spellCanonical`** — depth 9 · orphan-root

```text
🚀 CodeService.spellCanonical(tile: Tile, repeats?: number): string [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:303]
   ↳ The Code every tile in a symmetry class shares: {@link spell} of the one member `SymmetryService.canonicalTile` picks.
  └─> SymmetryService.canonicalTile(tile: Tile): Tile [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:206]
     ↳ The one tile of a symmetry class the corpus draws.
    └─> SymmetryService.orbit(tile: Tile): Tile[] [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:106]
       ↳ Every tile the symmetry group maps `tile` to, itself included, with duplicates left in.
      └─> SymmetryService.map(…)(element: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:107]
        └─> SymmetryService.transform(tile: Tile, options: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:177]
           ↳ The tile one group element maps `tile` to.
          └─> TileService.blankEdges(shape: TileShape): EdgesDraft [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:143]
             ↳ A tile's worth of unset edges, ready to be marked one at a time and handed to {@link build}.
            └─> TileService.grid(rowCount: number): boolean[][] [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:145]
              └─> TileService.from(…)(): boolean[] [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:146]
                └─> TileService.from(…)(): boolean [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:147]
```

**72. `IsDoubleChainCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsDoubleChainCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-double-chain-characteristic.service.ts:60]
   ↳ Checks the unit is two wrapping, reversing open strands at pitch `2 rows - 2` with runs of `width - 1` and `rows - 2`.
  └─> StrandUtilitiesService.hasStrandEnds(context: CharacteristicContext, strands: number): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/strand-utilities.service.ts:48]
     ↳ Whether the unit has exactly `strands` components and two free ends per component.
    └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-0-count-characteristic.service.ts:46]
       ↳ Counts the components of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**73. `IsForkCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsForkCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-fork-characteristic.service.ts:64]
   ↳ Checks the unit is one acyclic single-fork component with three free ends, no dots, and no comb.
  └─> IsCombCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-comb-characteristic.service.ts:57]
     ↳ Checks the unit is one straight-toothed tree with at least two forks.
    └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-0-count-characteristic.service.ts:46]
       ↳ Counts the components of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**74. `IsPureTreeCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsPureTreeCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-pure-tree-characteristic.service.ts:64]
   ↳ Checks the unit is one acyclic multi-fork component with no cross, no dots, no comb, and no arcade.
  └─> IsCombCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-comb-characteristic.service.ts:57]
     ↳ Checks the unit is one straight-toothed tree with at least two forks.
    └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-0-count-characteristic.service.ts:46]
       ↳ Counts the components of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**75. `IsSnakeCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsSnakeCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-snake-characteristic.service.ts:47]
   ↳ Checks the unit is one loop stretched along the band.
  └─> IsClosedLoopCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/structure/is-closed-loop-characteristic.service.ts:53]
     ↳ Checks the unit is one junction-free component closing one cycle with no free ends.
    └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-0-count-characteristic.service.ts:46]
       ↳ Counts the components of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**76. `IsWaterfallsCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsWaterfallsCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-waterfalls-characteristic.service.ts:48]
   ↳ Checks the unit is one arc that alternates every turn.
  └─> IsSingleArcCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/structure/is-single-arc-characteristic.service.ts:53]
     ↳ Checks the unit is one junction-free component with no cycle and two free ends.
    └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-0-count-characteristic.service.ts:46]
       ↳ Counts the components of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**77. `IsWhirlCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsWhirlCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-whirl-characteristic.service.ts:81]
   ↳ Checks every strand winds in and back out once per row, reversing once.
  └─> IsWhirlCharacteristicService.isOpenStrandSet(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-whirl-characteristic.service.ts:68]
     ↳ Whether the ink is dot-free, junction-free, acyclic strands with two free ends each.
    └─> BettiNumber1CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-1-count-characteristic.service.ts:46]
       ↳ Counts the independent loops of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**78. `DrawRecordService.scoreTileCrossing`** — depth ≥ 9 · orphan-root

```text
🚀 DrawRecordService.scoreTileCrossing(phase: CodeObject): number [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-record.service.ts:57]
  └─> CharacteristicsService.tileCrossingComponentDeltaCount(code: Code | CodeObject): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:290]
     ↳ The tile-crossing component delta of the Code exactly as filed, not of its repeating unit — the canonical-phase scorer,…
    └─> TileCrossingComponentDeltaCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/tile-crossing/tile-crossing-component-delta-count-characteristic.service.ts:45]
       ↳ Subtracts the band's component count from the lone tile's.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**79. `SymmetryService.variants`** — depth 8 · orphan-root

```text
🚀 SymmetryService.variants(tile: Tile): Tile[] [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:287]
   ↳ Every distinct tile that draws the same pattern as `tile`, itself included — its symmetry class, as tiles rather than…
  └─> SymmetryService.orbit(tile: Tile): Tile[] [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:106]
     ↳ Every tile the symmetry group maps `tile` to, itself included, with duplicates left in.
    └─> SymmetryService.map(…)(element: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:107]
      └─> SymmetryService.transform(tile: Tile, options: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:177]
         ↳ The tile one group element maps `tile` to.
        └─> TileService.blankEdges(shape: TileShape): EdgesDraft [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:143]
           ↳ A tile's worth of unset edges, ready to be marked one at a time and handed to {@link build}.
          └─> TileService.grid(rowCount: number): boolean[][] [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:145]
            └─> TileService.from(…)(): boolean[] [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:146]
              └─> TileService.from(…)(): boolean [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:147]
```

**80. `IsBoxesCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsBoxesCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-boxes-characteristic.service.ts:54]
   ↳ Checks the unit winds far more than it inflects, one hairpin per component.
  └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-0-count-characteristic.service.ts:46]
     ↳ Counts the components of the wrapped repeat graph.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**81. `IsChainCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsChainCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-chain-characteristic.service.ts:51]
   ↳ Checks the unit winds past its hairpins and links across the tile edge.
  └─> TileCrossingComponentDeltaCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/tile-crossing/tile-crossing-component-delta-count-characteristic.service.ts:45]
     ↳ Subtracts the band's component count from the lone tile's.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**82. `IsCrossCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsCrossCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-cross-characteristic.service.ts:54]
   ↳ Checks the unit crosses itself with no fork, loose end, or dot.
  └─> FreeEndCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/free-end-count-characteristic.service.ts:46]
     ↳ Counts the degree-one vertices of the wrapped repeat graph.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**83. `IsLinesCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsLinesCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-lines-characteristic.service.ts:47]
   ↳ Checks the ink is horizontal only and every row wraps around the band.
  └─> BettiNumber1CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-1-count-characteristic.service.ts:46]
     ↳ Counts the independent loops of the wrapped repeat graph.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**84. `IsMeshCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsMeshCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-mesh-characteristic.service.ts:60]
   ↳ Checks the unit is crossing lines that span both directions with nothing loose.
  └─> FreeEndCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/free-end-count-characteristic.service.ts:46]
     ↳ Counts the degree-one vertices of the wrapped repeat graph.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**85. `IsSwirlCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsSwirlCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-swirl-characteristic.service.ts:57]
   ↳ Checks the unit winds one way for two turns per row, less two.
  └─> BettiNumber1CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-1-count-characteristic.service.ts:46]
     ↳ Counts the independent loops of the wrapped repeat graph.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**86. `CharacteristicsService.onApplicationBootstrap`** — depth ≥ 7 · lifecycle

```text
🚀 CharacteristicsService.onApplicationBootstrap(): void [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:252]
   ↳ Discovers and checks every evaluator as the application boots, so a key with no evaluator, an unknown or doubly claimed…
  └─> CharacteristicsService.evaluators(): readonly CharacteristicEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:146]
     ↳ Every evaluator in key-list order, discovering them the first time only.
    └─> CharacteristicsService.discover(): readonly CharacteristicEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:109]
       ↳ Every discovered evaluator, lone or grouped, checked against the key lists and ordered by them.
      └─> CharacteristicsService.flatMap(…)(…): readonly CandidateEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:114]
        └─> CharacteristicsService.candidates(instance: unknown): readonly CandidateEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:99]
           ↳ The evaluator candidates one discovered provider holds: itself when it is shaped like an evaluator, every…
          └─> CharacteristicsService.filter(…)(member: unknown): member is CandidateEvaluator [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:103]
            └─> CharacteristicsService.isCandidateEvaluator(value: unknown): value is CandidateEvaluator [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:153]
               ↳ Whether a discovered provider has an evaluator's shape: a `compute` method and metadata naming a string key.
```

**87. `CharacteristicsService.metadata`** — depth ≥ 7 · orphan-root

```text
🚀 CharacteristicsService.metadata(): readonly CharacteristicMetadata[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:239]
   ↳ Every registered characteristic's metadata, in key-list order.
  └─> CharacteristicsService.evaluators(): readonly CharacteristicEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:146]
     ↳ Every evaluator in key-list order, discovering them the first time only.
    └─> CharacteristicsService.discover(): readonly CharacteristicEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:109]
       ↳ Every discovered evaluator, lone or grouped, checked against the key lists and ordered by them.
      └─> CharacteristicsService.flatMap(…)(…): readonly CandidateEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:114]
        └─> CharacteristicsService.candidates(instance: unknown): readonly CandidateEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:99]
           ↳ The evaluator candidates one discovered provider holds: itself when it is shaped like an evaluator, every…
          └─> CharacteristicsService.filter(…)(member: unknown): member is CandidateEvaluator [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:103]
            └─> CharacteristicsService.isCandidateEvaluator(value: unknown): value is CandidateEvaluator [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:153]
               ↳ Whether a discovered provider has an evaluator's shape: a `compute` method and metadata naming a string key.
```

**88. `TileCrossingCycleCountCharacteristicService.compute`** — depth ≥ 7 · orphan-root

```text
🚀 TileCrossingCycleCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/tile-crossing/tile-crossing-cycle-count-characteristic.service.ts:45]
   ↳ Subtracts the lone tile's loop count from the band's.
  └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133]
     ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points…
    └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61]
       ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
      └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114]
         ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
        └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117]
          └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118]
            └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:109]
               ↳ One point's identity in the graph, which is its position and nothing else.
```

**89. `IsClaspsCharacteristicService.compute`** — depth 7 · orphan-root

```text
🚀 IsClaspsCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-clasps-characteristic.service.ts:58]
   ↳ Checks the unit is hooks that wind once per row, less one, and reverse tightly.
  └─> ReversesAtItsTightestTurnCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:317]
     ↳ Walks every strand of a junction-free Code's wrapped repeat graph, reporting whether any turn lands exactly one step…
    └─> ReversesAtItsTightestTurnCharacteristicService.tracePaths(adjacency: Map<string, string[]>, columns: number): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:242]
       ↳ Traces every disjoint path in the adjacency graph, reporting whether any of them turns tightly.
      └─> ReversesAtItsTightestTurnCharacteristicService.traceSinglePath(…): void [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:265]
         ↳ Traces a single path starting from a node.
        └─> ReversesAtItsTightestTurnCharacteristicService.advancePath(…): { currentNode: string; direction: number; nextNode: string | undefined; stepsSinceTurn: number; } [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:56]
           ↳ Advances one step along the path and updates tracking state.
          └─> ReversesAtItsTightestTurnCharacteristicService.getDirection(from: string, to: string, columns: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:197]
             ↳ Returns 0=Up, 1=Right, 2=Down, 3=Left or -1 if invalid.
            └─> ReversesAtItsTightestTurnCharacteristicService.parseKey(key: string): { column: number; row: number; } [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:233]
               ↳ Parses a node string key into column and row integers.
```

**90. `IsParallelCharacteristicService.compute`** — depth 7 · orphan-root

```text
🚀 IsParallelCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-parallel-characteristic.service.ts:55]
   ↳ Checks the unit is junction-free strokes that turn back at most once in a row.
  └─> MaxMonotonicTurnLengthCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/max-monotonic-turn-length-characteristic.service.ts:48]
     ↳ Finds the longest same-handed run of turns over every strand.
    └─> PathUtilitiesService.strands(edges: readonly CodeEdge[]): Strand[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:206]
       ↳ Cuts one repeat's ink into strands — maximal runs through degree-two points — over the cyclic band `edges` describes.
      └─> PathUtilitiesService.walk(graph: HalfEdgeGraph, start: HalfEdge, visited: Set<number>): Turn[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:108]
         ↳ Walks one strand from `start` until it ends or returns to an edge already walked, marking every edge it crosses.
        └─> PathUtilitiesService.continuation(graph: HalfEdgeGraph, arrival: HalfEdge): HalfEdge | undefined [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:39]
           ↳ The half-edge a strand leaves by after arriving along `arrival`, or `undefined` when it arrives at a free end or a…
          └─> PathUtilitiesService.find(…)(halfEdge: HalfEdge): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:47]
            └─> PathUtilitiesService.opposite(heading: Heading): Heading [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:78]
               ↳ The heading pointing the other way.
```

**91. `LetterUtilitiesService.compute`** — depth 7 · orphan-root

```text
🚀 LetterUtilitiesService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:151]
  └─> LetterUtilitiesService.count(…): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:85]
     ↳ The count of `template` glyphs in a context, scanned the first time any evaluator asks for it. `ink` is the template's…
    └─> SubmatrixUtilitiesService.countIsolatedGlyphs(matrix: Matrix, template: readonly string[]): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:112]
       ↳ Counts the minimal isolated glyphs of a matrix drawn exactly as `template`.
      └─> SubmatrixUtilitiesService.digitGrid(matrix: Matrix): readonly (readonly number[])[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:197]
         ↳ Every point's hexadecimal Code digit, row by row, as {@link SubmatrixUtilitiesService.pointDigitAt} spells it.
        └─> SubmatrixUtilitiesService.map(…)(points: readonly MatrixPoint[], row: number): number[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:203]
          └─> SubmatrixUtilitiesService.map(…)(_point: MatrixPoint, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:204]
            └─> SubmatrixUtilitiesService.pointDigitAt(matrix: Matrix, row: number, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:246]
               ↳ The hexadecimal Code digit of the point at `(row, column)` — north 8, south 4, east 2, west 1 — with columns wrapping,…
```

**92. `HorizontalRectangleCountCharacteristicService.compute`** — depth ≥ 6 · orphan-root

```text
🚀 HorizontalRectangleCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/horizontal-rectangle-count-characteristic.service.ts:48]
   ↳ Counts the isolated rings whose width and height compare as `w > h`.
  └─> RectangleUtilitiesService.countIsolatedRectangles(matrix: Matrix, isCounted: (width: number, height: number) => boolean): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:158]
     ↳ Counts the isolated rectangles of a matrix whose size `isCounted` accepts.
    └─> RectangleUtilitiesService.isIsolatedRectangleAt(…): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:32]
       ↳ Whether an isolated rectangle has its north-west corner at `origin` and a size `isCounted` accepts: the top and left…
      └─> RectangleUtilitiesService.ringCloses(…): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:73]
         ↳ Whether the bottom and right sides of a ring whose top and left sides already reach their corners are exactly straights…
        └─> RectangleUtilitiesService.from(…)(_unused: unknown, offset: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:80]
          └─> SubmatrixUtilitiesService.pointDigitAt(matrix: Matrix, row: number, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:246]
             ↳ The hexadecimal Code digit of the point at `(row, column)` — north 8, south 4, east 2, west 1 — with columns wrapping,…
```

**93. `VerticalRectangleCountCharacteristicService.compute`** — depth ≥ 6 · orphan-root

```text
🚀 VerticalRectangleCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/vertical-rectangle-count-characteristic.service.ts:48]
   ↳ Counts the isolated rings whose width and height compare as `w < h`.
  └─> RectangleUtilitiesService.countIsolatedRectangles(matrix: Matrix, isCounted: (width: number, height: number) => boolean): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:158]
     ↳ Counts the isolated rectangles of a matrix whose size `isCounted` accepts.
    └─> RectangleUtilitiesService.isIsolatedRectangleAt(…): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:32]
       ↳ Whether an isolated rectangle has its north-west corner at `origin` and a size `isCounted` accepts: the top and left…
      └─> RectangleUtilitiesService.ringCloses(…): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:73]
         ↳ Whether the bottom and right sides of a ring whose top and left sides already reach their corners are exactly straights…
        └─> RectangleUtilitiesService.from(…)(_unused: unknown, offset: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:80]
          └─> SubmatrixUtilitiesService.pointDigitAt(matrix: Matrix, row: number, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:246]
             ↳ The hexadecimal Code digit of the point at `(row, column)` — north 8, south 4, east 2, west 1 — with columns wrapping,…
```

**94. `IsBarsCharacteristicService.compute`** — depth 5 · orphan-root

```text
🚀 IsBarsCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-bars-characteristic.service.ts:53]
   ↳ Checks the ink is vertical only, fully inked, and spans the band.
  └─> LongestVerticalRunLengthCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/run/longest-vertical-run-length-characteristic.service.ts:46]
     ↳ Finds the longest vertical run over every column.
    └─> RunUtilitiesService.longestVerticalRunLength(matrix: Matrix): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/run/run-utilities.service.ts:84]
       ↳ The longest straight vertical run of ink anywhere in the Code.
      └─> RunUtilitiesService.from(…)(_unused: unknown, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/run/run-utilities.service.ts:91]
        └─> RunUtilitiesService.longestColumnRunLength(matrix: Matrix, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/run/run-utilities.service.ts:24]
           ↳ The longest straight run of ink in `column`, reading each row's south arm directly and never wrapping across rows.
```

**95. `TileService.assertWellFormed`** — depth ≥ 4 · orphan-root

```text
🚀 TileService.assertWellFormed(tile: Tile): void [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:120]
   ↳ Refuses a grid of direction bits that is not a tile, naming what is wrong with it.
  └─> TileService.assertPointAgrees(tile: Tile, row: number, column: number): void [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:50]
     ↳ Refuses one point whose bits disagree with its neighbors'.
    └─> TileService.assertPointJoinsBelow(point: Directions, below: Directions | undefined, at: TilePoint): void [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:72]
       ↳ Refuses one point whose southward bit the point below does not answer, or whose north is claimed where the cap tick…
      └─> MalformedTileError.constructor(reason: string): MalformedTileError [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.constants.ts:31]
```

**96. `CodeService.anonymous`** — depth 4 · orphan-root

```text
🚀 CodeService.anonymous(c: CodeObject): CodeObject[] [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:149]
  └─> CodeService.from(…)(_: unknown, index: number): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:150]
    └─> CodeService.rotate(code: CodeObject, shift: number): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:272]
       ↳ The Code shifted `shift` columns west, wrapping each row around its own span — the same band cut at a different place.
      └─> CodeService.from(…)(_unused: unknown, row: number): string [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:275]
```

**97. `MatrixService.submatrices`** — depth 4 · orphan-root

```text
🚀 MatrixService.submatrices(matrix: Matrix, height: number, width: number): Submatrix[] [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:119]
   ↳ Extracts sliding submatrix kernels of size `height x width` over the matrix with horizontal column wrapping.
  └─> MatrixService.extractSubmatrix(…): MatrixPoint[][] [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:33]
     ↳ Extracts a 2D submatrix kernel starting at the given origin with the specified size.
    └─> MatrixService.from(…)(_unusedRow: unknown, deltaRow: number): MatrixPoint[] [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:42]
      └─> MatrixService.from(…)(_unusedColumn: unknown, deltaColumn: number): MatrixPoint [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:47]
```

**98. `DrawPoolService.onModuleDestroy`** — depth 3 · lifecycle

```text
🚀 DrawPoolService.onModuleDestroy(): Promise<void> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:213]
   ↳ Ends the pool's threads with the application, so none outlives it.
  └─> DrawPoolService.close(): Promise<void> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:205]
     ↳ Ends every thread the pool spawned; the next shape spawns fresh ones.
    └─> DrawPoolService.map(…)(worker: Worker): Promise<number> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:209]
```

**99. `MatrixService.toCode`** — depth 3 · orphan-root

```text
🚀 MatrixService.toCode(matrix: Matrix, repeats?: number): Code [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:157]
   ↳ Encodes a 2D Matrix back into a formatted meander Code string.
  └─> MatrixService.flatMap(…)(this: undefined, row: readonly MatrixPoint[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:166]
    └─> MatrixService.map(…)(point: MatrixPoint): string [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:167]
```

**100. `BottomBorderTouchCountCharacteristicService.compute`** — depth 3 · orphan-root

```text
🚀 BottomBorderTouchCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/bottom-border-touch-count-characteristic.service.ts:49]
   ↳ Counts the separate runs of ink on the last row.
  └─> PathUtilitiesService.rowTouchCount(edges: readonly CodeEdge[], row: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:177]
     ↳ How many separate runs of ink touch `row`: its inked points, grouped by the eastward edges joining neighbors within…
    └─> PathUtilitiesService.position(key: string): { column: number; row: number; } [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:87]
       ↳ The row and column a `row,column` point key names.
```

**101. `TopBorderTouchCountCharacteristicService.compute`** — depth 3 · orphan-root

```text
🚀 TopBorderTouchCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/top-border-touch-count-characteristic.service.ts:49]
   ↳ Counts the separate runs of ink on the first row.
  └─> PathUtilitiesService.rowTouchCount(edges: readonly CodeEdge[], row: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:177]
     ↳ How many separate runs of ink touch `row`: its inked points, grouped by the eastward edges joining neighbors within…
    └─> PathUtilitiesService.position(key: string): { column: number; row: number; } [projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:87]
       ↳ The row and column a `row,column` point key names.
```

**102. `EmbeddedUCountCharacteristicService.compute`** — depth 3 · orphan-root

```text
🚀 EmbeddedUCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/embedded/embedded-u-count-characteristic.service.ts:92]
   ↳ Counts every 2×2 window whose ink forms a U in any rotation.
  └─> EmbeddedUCountCharacteristicService.windowDigits(…): { bl: number; br: number; tl: number; tr: number; } [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/embedded/embedded-u-count-characteristic.service.ts:72]
     ↳ Every 2×2 window's four digits, read without wrapping past the last row.
    └─> SubmatrixUtilitiesService.pointDigitAt(matrix: Matrix, row: number, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:246]
       ↳ The hexadecimal Code digit of the point at `(row, column)` — north 8, south 4, east 2, west 1 — with columns wrapping,…
```

**103. `IsDotsCharacteristicService.compute`** — depth 3 · orphan-root

```text
🚀 IsDotsCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-dots-characteristic.service.ts:43]
   ↳ Checks no point of the unit is inked.
  └─> InkPointCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/ink-point-count-characteristic.service.ts:45]
     ↳ Counts the points that carry at least one arm.
    └─> PointUtilitiesService.armCount(point: MatrixPoint): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/point-utilities.service.ts:31]
       ↳ How many of a point's four arms carry ink — its raw digit degree, read directly off the point rather than through the…
```

**104. `TileEnumerationService.isMatching`** — depth 3 · orphan-root

```text
🚀 TileEnumerationService.isMatching(tile: Tile): boolean [projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:213]
   ↳ Whether every point of a tile is touched by at most one edge — the retired `mosaic` generator's exact-cover rule,…
  └─> TileService.incidentEdges(tile: Tile, row: number, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:218]
     ↳ How many distinct edges touch a point, which differs from {@link degree} at one column and nowhere else: there a set…
    └─> TileService.degree(directions: Directions): number [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:188]
       ↳ How many of a point's four direction bits are set — the point's degree as the drawing shows it.
```

**105. `DrawIndexService.rows`** — depth 3 · orphan-root

```text
🚀 DrawIndexService.rows(…): (readonly Meander[])[] [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:383]
  └─> DrawIndexService.heldRows(…): (readonly Meander[])[] [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:146]
     ↳ A pattern's rows already in memory, in the order its page lists them.
    └─> DrawIndexService.toSorted(…)(left: Meander, right: Meander): number [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:153]
```

**106. `TileService.isBare`** — depth 2 · orphan-root

```text
🚀 TileService.isBare(directions: Directions): boolean [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:231]
   ↳ Whether a point carries no ink at all, and so draws a dot.
  └─> TileService.degree(directions: Directions): number [projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:188]
     ↳ How many of a point's four direction bits are set — the point's degree as the drawing shows it.
```

**107. `MatrixService.rotate`** — depth 2 · orphan-root

```text
🚀 MatrixService.rotate(matrix: Matrix, step: number): Matrix [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:101]
   ↳ Shifts/rotates columns of the matrix by `step` positions westward with cyclic column wrapping.
  └─> MatrixService.map(…)(row: readonly MatrixPoint[]): MatrixPoint[] [projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:113]
```

**108. `DoubleVerticalEdgeCountCharacteristicService.compute`** — depth 2 · orphan-root

```text
🚀 DoubleVerticalEdgeCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/double-vertical-edge-count-characteristic.service.ts:47]
   ↳ Counts the points whose only arms are north and south.
  └─> SubmatrixUtilitiesService.countPointsWithExactArms(matrix: Matrix, arms: readonly MatrixPointArm[]): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:161]
     ↳ Counts the points whose ink leaves by exactly `arms` — every named arm set and every other arm clear — which is the…
```

**109. `SouthEdgeCountCharacteristicService.compute`** — depth 2 · orphan-root

```text
🚀 SouthEdgeCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/south-edge-count-characteristic.service.ts:46]
   ↳ Counts the points with a south arm.
  └─> SubmatrixUtilitiesService.countPointsWithArm(matrix: Matrix, arm: MatrixPointArm): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:141]
     ↳ Counts the points whose ink leaves by `arm`, whatever other arms they carry — a lone arm, a straight edge, a corner, a…
```

**110. `WestEdgeCountCharacteristicService.compute`** — depth 2 · orphan-root

```text
🚀 WestEdgeCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/west-edge-count-characteristic.service.ts:46]
   ↳ Counts the points with a west arm.
  └─> SubmatrixUtilitiesService.countPointsWithArm(matrix: Matrix, arm: MatrixPointArm): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:141]
     ↳ Counts the points whose ink leaves by `arm`, whatever other arms they carry — a lone arm, a straight edge, a corner, a…
```

**111. `DrawPoolService.onMessage`** — depth ≥ 2 · orphan-root

```text
🚀 DrawPoolService.onMessage(reply: DrawWorkerReply): void [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:89]
  └─> DrawWorkerError.constructor(message: string): DrawWorkerError [projects/meanderaw/meanderaw-cli/src/modules/draw/draw.constants.ts:23]
```

**112. `DrawIndexService.rows`** — depth 2 · orphan-root

```text
🚀 DrawIndexService.rows(…): AsyncGenerator<Meander[], any, any> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:355]
  └─> DatabaseService.patternRows(key: PatternCharacteristicKey, batchSize?: number): AsyncGenerator<Meander[]> [projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:110]
     ↳ The rows one pattern characteristic holds for, in batches of `batchSize`, ordered by rows, then columns, then Code —…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CorpusService.ingestOne` | 12 | `CodeService.parse`, `CorpusService.canonicalPhase(…)`, `CodeService.canonicalPhase`, `CharacteristicsService.compute`, `CharacteristicsService.isReducible`, `CodeService.format`, `DatabaseService.findOneByCode`, `DatabaseService.save`, `CharacteristicsService.stored`, `CorpusService.symmetricalCodes(…)`, `CodeService.symmetricalCodes`, `DuplicateCorpusCodeError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:76` |
| `IsForkCharacteristicService.compute` | 7 | `BettiNumber0CountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `ForkCountCharacteristicService.compute`, `CrossCountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `DotCountCharacteristicService.compute`, `IsCombCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-fork-characteristic.service.ts:64` |
| `IsPureTreeCharacteristicService.compute` | 7 | `BettiNumber0CountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `ForkCountCharacteristicService.compute`, `CrossCountCharacteristicService.compute`, `DotCountCharacteristicService.compute`, `IsCombCharacteristicService.compute`, `IsArcadeCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-pure-tree-characteristic.service.ts:64` |

<details>
<summary>362 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TileEnumerationService.enumerate` | 7 | `TileEnumerationService.isAdmitted`, `OversizedTileError.constructor`, `TileEnumerationService.edges`, `TileEnumerationService.map(…)`, `TileEnumerationService.toSorted(…)`, `TileEnumerationService.map(…)`, `TileEnumerationService.orbitMinima` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:165` |
| `DrawRecordService.record` | 7 | `CodeService.parse`, `CodeService.canonicalPhase`, `CharacteristicsService.compute`, `CharacteristicsService.isReducible`, `CharacteristicsService.stored`, `CodeService.format`, `CodeService.symmetricalCodes` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-record.service.ts:45` |
| `IsArcadeCharacteristicService.compute` | 6 | `ForkCountCharacteristicService.compute`, `CrossCountCharacteristicService.compute`, `DotCountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `LongestVerticalRunLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-arcade-characteristic.service.ts:61` |
| `IsDoubleChainCharacteristicService.compute` | 6 | `CompoundUtilitiesService.isJunctionFree`, `StrandUtilitiesService.hasStrandEnds`, `BettiNumber1CountCharacteristicService.compute`, `StrandUtilitiesService.isWrappingReversal`, `LongestHorizontalRunLengthCharacteristicService.compute`, `LongestVerticalRunLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-double-chain-characteristic.service.ts:60` |
| `IsMeshCharacteristicService.compute` | 6 | `CrossCountCharacteristicService.compute`, `CornerCountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `DotCountCharacteristicService.compute`, `TileCrossingCountCharacteristicService.compute`, `LongestVerticalRunLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-mesh-characteristic.service.ts:60` |
| `IsWhirlCharacteristicService.compute` | 6 | `BettiNumber0CountCharacteristicService.compute`, `IsWhirlCharacteristicService.isOpenStrandSet`, `MaxMonotonicTurnLengthCharacteristicService.compute`, `TotalTurnCountCharacteristicService.compute`, `InflectionCountCharacteristicService.compute`, `LongestHorizontalRunLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-whirl-characteristic.service.ts:81` |
| `TileEnumerationService.orbitMinima` | 6 | `TileEnumerationService.edges`, `TileEnumerationService.isAdmitted`, `OversizedTileError.constructor`, `TileEnumerationService.map(…)`, `SymmetryService.edgePermutations`, `TileEnumerationService.every(…)` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:254` |
| `DrawIndexService.pages` | 6 | `DrawIndexService.group(…)`, `DrawIndexService.group`, `DrawIndexService.flatMap(…)`, `DrawIndexService.indexPage`, `DrawIndexService.map(…)`, `DrawIndexService.patternPage` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:183` |
| `DrawIndexService.renderBand` | 6 | `GeometryService.compute`, `DrawIndexService.format`, `DrawIndexService.escape`, `CodeService.parse`, `DrawingService.render`, `DrawIndexService.renderRepeats` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:244` |
| `IsClaspsCharacteristicService.compute` | 5 | `CompoundUtilitiesService.isJunctionFree`, `ReversesAtItsTightestTurnCharacteristicService.compute`, `EndsAreLatticeNeighborsCharacteristicService.compute`, `LongestHorizontalRunLengthCharacteristicService.compute`, `MaxMonotonicTurnLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-clasps-characteristic.service.ts:58` |
| `IsCombCharacteristicService.compute` | 5 | `BettiNumber0CountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `CrossCountCharacteristicService.compute`, `ForkCountCharacteristicService.compute`, `TotalTurnCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-comb-characteristic.service.ts:57` |
| `IsSwirlCharacteristicService.compute` | 5 | `MaxMonotonicTurnLengthCharacteristicService.compute`, `CompoundUtilitiesService.isJunctionFree`, `BettiNumber1CountCharacteristicService.compute`, `TightestTurnCountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-swirl-characteristic.service.ts:57` |
| `IsWhirlCharacteristicService.isOpenStrandSet` | 5 | `CompoundUtilitiesService.isJunctionFree`, `DotCountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `BettiNumber0CountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-whirl-characteristic.service.ts:68` |
| `LetterUtilitiesService.orientation` | 5 | `LetterUtilitiesService.parse`, `LetterUtilitiesService.flips`, `LetterUtilitiesService.reduce(…)`, `LetterUtilitiesService.turnClockwise`, `SubmatrixUtilitiesService.glyphWindow` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:208` |
| `RectangleUtilitiesService.ringCloses` | 5 | `RectangleUtilitiesService.from(…)`, `RectangleUtilitiesService.from(…)`, `SubmatrixUtilitiesService.pointDigitAt`, `RectangleUtilitiesService.every(…)`, `RectangleUtilitiesService.every(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:73` |
| `DrawingService.render` | 5 | `GeometryService.compute`, `DrawingService.codeSegments`, `GeometryService.borderPath`, `SvgService.render`, `DrawingService.format` | `projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:125` |
| `DrawEnumerationService.persist` | 5 | `DatabaseService.codes`, `DrawPoolService.batches`, `DatabaseService.saveAll`, `DrawEnumerationService.filter(…)`, `DrawPoolService.close` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-enumeration.service.ts:67` |
| `DrawIndexService.shapeSections` | 5 | `DrawIndexService.reduce(…)`, `DrawIndexService.map(…)`, `DrawIndexService.sectionHead`, `DrawIndexService.renderFigure`, `DrawIndexService.shapeHead` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:301` |
| `DrawCommand.drawAll` | 5 | `DatabaseService.clear`, `CorpusService.ingest`, `DrawCommand.map(…)`, `DrawEnumerationService.drawAll`, `DrawCommand.writePages` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:109` |
| `SymmetryService.transform` | 4 | `TileService.edges`, `TileService.blankEdges`, `SymmetryService.place`, `TileService.build` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:177` |
| `CodeService.symmetricalCodes` | 4 | `CodeService.format`, `CodeService.map(…)`, `SymmetryService.reflections`, `CodeService.tile` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:339` |
| `ConnectivityService.connectivity` | 4 | `ConnectivityService.edges`, `ConnectivityService.adjacency`, `GraphService.components`, `ConnectivityService.freeEnds` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:133` |
| `CharacteristicsService.discover` | 4 | `CharacteristicsService.flatMap(…)`, `CharacteristicsService.verify`, `CharacteristicRegistryError.constructor`, `CharacteristicsService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:109` |
| `CharacteristicsService.verify` | 4 | `CharacteristicsService.isCharacteristicEvaluator`, `CharacteristicsService.isCharacteristicKey`, `CharacteristicRegistryError.constructor`, `CharacteristicsService.valueTypeOf` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:201` |
| `CharacteristicsService.compute` | 4 | `CharacteristicContextService.create`, `CharacteristicsService.map(…)`, `CharacteristicsService.evaluators`, `CharacteristicsService.assertCharacteristics` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:219` |
| `CharacteristicsService.stored` | 4 | `CharacteristicsService.map(…)`, `CharacteristicsService.filter(…)`, `CharacteristicsService.map(…)`, `CharacteristicsService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:262` |
| `SubmatrixUtilitiesService.countIsolatedGlyphs` | 4 | `SubmatrixUtilitiesService.glyphCells`, `SubmatrixUtilitiesService.map(…)`, `SubmatrixUtilitiesService.digitGrid`, `SubmatrixUtilitiesService.matchesAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:112` |
| `ReversesAtItsTightestTurnCharacteristicService.traceSinglePath` | 4 | `ReversesAtItsTightestTurnCharacteristicService.findStartNode`, `ReversesAtItsTightestTurnCharacteristicService.findNextNode`, `ReversesAtItsTightestTurnCharacteristicService.advancePath`, `ReversesAtItsTightestTurnCharacteristicService.checkFinalLoopTurn` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:265` |
| `ReversesAtItsTightestTurnCharacteristicService.compute` | 4 | `ReversesAtItsTightestTurnCharacteristicService.isJunctionFree`, `ConnectivityService.edges`, `ReversesAtItsTightestTurnCharacteristicService.buildAdjacencyGraph`, `ReversesAtItsTightestTurnCharacteristicService.tracePaths` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:317` |
| `CornerCountCharacteristicService.compute` | 4 | `NorthEastCornerCountCharacteristicService.compute`, `NorthWestCornerCountCharacteristicService.compute`, `SouthEastCornerCountCharacteristicService.compute`, `SouthWestCornerCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/corner/corner-count-characteristic.service.ts:56` |
| `ForkCountCharacteristicService.compute` | 4 | `NorthForkCountCharacteristicService.compute`, `SouthForkCountCharacteristicService.compute`, `EastForkCountCharacteristicService.compute`, `WestForkCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/fork/fork-count-characteristic.service.ts:55` |
| `IsClosedLoopCharacteristicService.compute` | 4 | `BettiNumber0CountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `CompoundUtilitiesService.isJunctionFree` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/structure/is-closed-loop-characteristic.service.ts:53` |
| `IsSingleArcCharacteristicService.compute` | 4 | `BettiNumber0CountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `CompoundUtilitiesService.isJunctionFree` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/structure/is-single-arc-characteristic.service.ts:53` |
| `IsBarsCharacteristicService.compute` | 4 | `EdgeCountCharacteristicService.compute`, `EastEdgeCountCharacteristicService.compute`, `DotCountCharacteristicService.compute`, `LongestVerticalRunLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-bars-characteristic.service.ts:53` |
| `IsBoxesCharacteristicService.compute` | 4 | `MaxMonotonicTurnLengthCharacteristicService.compute`, `InflectionCountCharacteristicService.compute`, `TightestTurnCountCharacteristicService.compute`, `BettiNumber0CountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-boxes-characteristic.service.ts:54` |
| `IsCrossCharacteristicService.compute` | 4 | `CrossCountCharacteristicService.compute`, `ForkCountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `DotCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-cross-characteristic.service.ts:54` |
| `StrandUtilitiesService.isWrappingReversal` | 4 | `TileCrossingCountCharacteristicService.compute`, `ReversesAtItsTightestTurnCharacteristicService.compute`, `EndsOnBorderRulesCharacteristicService.compute`, `StrandUtilitiesService.isFullInkWithoutDots` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/strand-utilities.service.ts:67` |
| `IsParallelCharacteristicService.compute` | 4 | `CompoundUtilitiesService.isJunctionFree`, `DotCountCharacteristicService.compute`, `EdgeCountCharacteristicService.compute`, `MaxMonotonicTurnLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-parallel-characteristic.service.ts:55` |
| `DatabaseService.saveAll` | 4 | `DatabaseService.filter(…)`, `DatabaseService.map(…)`, `DatabaseService.map(…)`, `DatabaseService.transaction(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:229` |
| `TileEnumerationService.tile` | 4 | `TileService.blankEdges`, `TileEnumerationService.edges`, `TileEnumerationService.set`, `TileService.build` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:282` |
| `DrawWorkerService.map(…)` | 4 | `DrawRecordService.record`, `CodeService.spell`, `SymmetryService.canonicalTile`, `TileEnumerationService.tile` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-worker.service.ts:49` |
| `DrawPoolService.batches` | 4 | `DrawPoolService.batchesOf`, `TileEnumerationService.orbitMinima`, `DrawWorkerService.records`, `DrawPoolService.waves` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:186` |
| `CodeService.parse` | 3 | `CodeService.parseFormatted`, `CodeService.parseBare`, `InvalidCodeFormatError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:215` |
| `CodeService.map(…)` | 3 | `CodeService.format`, `CodeService.canonicalPhase`, `CodeService.spellDigits` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:347` |
| `CharacteristicContextService.create` | 3 | `CharacteristicContextService.build`, `CodeService.reduceToUnit`, `CharacteristicContextService.parse` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:66` |
| `ConnectivityService.edges` | 3 | `ConnectivityService.key`, `ConnectivityService.joinsEast`, `ConnectivityService.joinsSouth` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:152` |
| `CharacteristicsService.assertCharacteristics` | 3 | `CharacteristicsService.find(…)`, `CharacteristicRegistryError.constructor`, `CharacteristicsService.valueTypeOf` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:80` |
| `CharacteristicsService.candidates` | 3 | `CharacteristicsService.isCandidateEvaluator`, `CharacteristicsService.isCandidateGroup`, `CharacteristicsService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:99` |
| `EndsOnBorderRulesCharacteristicService.compute` | 3 | `EndUtilitiesService.freeEndPoints`, `ConnectivityService.edges`, `EndsOnBorderRulesCharacteristicService.every(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/end/ends-on-border-rules-characteristic.service.ts:50` |
| `SubmatrixUtilitiesService.flatMap(…)` | 3 | `SubmatrixUtilitiesService.map(…)`, `SubmatrixUtilitiesService.filter(…)`, `SubmatrixUtilitiesService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:59` |
| `PathUtilitiesService.halfEdgeGraph` | 3 | `PathUtilitiesService.position`, `PathUtilitiesService.attach`, `PathUtilitiesService.opposite` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:59` |
| `PathUtilitiesService.strands` | 3 | `PathUtilitiesService.halfEdgeGraph`, `PathUtilitiesService.flatMap(…)`, `PathUtilitiesService.walk` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:206` |
| `InflectionCountCharacteristicService.compute` | 3 | `InflectionCountCharacteristicService.reduce(…)`, `PathUtilitiesService.strands`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/inflection-count-characteristic.service.ts:49` |
| `InflectionCountCharacteristicService.reduce(…)` | 3 | `InflectionCountCharacteristicService.filter(…)`, `PathUtilitiesService.neighborPairs`, `PathUtilitiesService.signedTurns` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/inflection-count-characteristic.service.ts:53` |
| `MaxMonotonicTurnLengthCharacteristicService.compute` | 3 | `MaxMonotonicTurnLengthCharacteristicService.map(…)`, `PathUtilitiesService.strands`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/max-monotonic-turn-length-characteristic.service.ts:48` |
| `ReversesAtItsTightestTurnCharacteristicService.advancePath` | 3 | `ReversesAtItsTightestTurnCharacteristicService.getDirection`, `ReversesAtItsTightestTurnCharacteristicService.applyTurn`, `ReversesAtItsTightestTurnCharacteristicService.findNextNode` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:56` |
| `ReversesAtItsTightestTurnCharacteristicService.findNextNode` | 3 | `ReversesAtItsTightestTurnCharacteristicService.getNeighbors`, `ReversesAtItsTightestTurnCharacteristicService.find(…)`, `ReversesAtItsTightestTurnCharacteristicService.find(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:156` |
| `TightestTurnCountCharacteristicService.compute` | 3 | `TightestTurnCountCharacteristicService.reduce(…)`, `PathUtilitiesService.strands`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/tightest-turn-count-characteristic.service.ts:49` |
| `TotalTurnCountCharacteristicService.compute` | 3 | `TotalTurnCountCharacteristicService.reduce(…)`, `PathUtilitiesService.strands`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/total-turn-count-characteristic.service.ts:48` |
| `IsChainCharacteristicService.compute` | 3 | `MaxMonotonicTurnLengthCharacteristicService.compute`, `TightestTurnCountCharacteristicService.compute`, `TileCrossingComponentDeltaCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-chain-characteristic.service.ts:51` |
| `LetterUtilitiesService.evaluator` | 3 | `LetterUtilitiesService.description`, `SubmatrixUtilitiesService.glyphFormula`, `LetterUtilitiesService.displayName` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:142` |
| `RectangleUtilitiesService.isIsolatedRectangleAt` | 3 | `SubmatrixUtilitiesService.pointDigitAt`, `RectangleUtilitiesService.sideLength`, `RectangleUtilitiesService.ringCloses` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:32` |
| `TileEnumerationService.map(…)` | 3 | `SymmetryService.canonicalTile`, `TileEnumerationService.tile`, `SymmetryService.edgeKey` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:179` |
| `DrawPoolService.waves` | 3 | `DrawPoolService.spawn`, `DrawPoolService.wave`, `DrawPoolService.catch(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:152` |
| `TileService.assertPointAgrees` | 2 | `MalformedTileError.constructor`, `TileService.assertPointJoinsBelow` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:50` |
| `TileService.assertWellFormed` | 2 | `MalformedTileError.constructor`, `TileService.assertPointAgrees` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:120` |
| `TileService.from(…)` | 2 | `TileService.horizontal`, `TileService.vertical` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:168` |
| `TileService.edges` | 2 | `TileService.map(…)`, `TileService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:198` |
| `SymmetryService.edgePermutation` | 2 | `SymmetryService.from(…)`, `SymmetryService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:48` |
| `SymmetryService.orbit` | 2 | `SymmetryService.map(…)`, `SymmetryService.elements` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:106` |
| `SymmetryService.place` | 2 | `TileService.mark`, `SymmetryService.mapColumn` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:120` |
| `SymmetryService.signature` | 2 | `SymmetryService.flatMap(…)`, `SymmetryService.edgeKey` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:168` |
| `SymmetryService.canonicalTile` | 2 | `SymmetryService.signature`, `SymmetryService.orbit` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:206` |
| `SymmetryService.edgeKey` | 2 | `TileService.edges`, `SymmetryService.flatMap(…)` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:234` |
| `SymmetryService.edgePermutations` | 2 | `SymmetryService.map(…)`, `SymmetryService.elements` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:255` |
| `SymmetryService.variants` | 2 | `SymmetryService.orbit`, `SymmetryService.edgeKey` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:287` |
| `CodeService.validateDigits` | 2 | `InvalidCodeLengthError.constructor`, `InvalidCodeCharacterError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:125` |
| `CodeService.spell` | 2 | `CodeService.format`, `CodeService.spellDigits` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:289` |
| `CodeService.spellCanonical` | 2 | `CodeService.spell`, `SymmetryService.canonicalTile` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:303` |
| `MatrixService.fromCode` | 2 | `CodeService.parse`, `MatrixService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:65` |
| `MatrixService.toCode` | 2 | `MatrixService.flatMap(…)`, `CodeService.format` | `projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:157` |
| `CharacteristicContextService.build` | 2 | `MatrixService.fromCode`, `CodeService.spellDigits` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:39` |
| `CharacteristicContextService.createUnreduced` | 2 | `CharacteristicContextService.build`, `CharacteristicContextService.parse` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:76` |
| `ConnectivityService.freeEnds` | 2 | `ConnectivityService.bump`, `ConnectivityService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:80` |
| `CharacteristicsService.isCharacteristicEvaluator` | 2 | `CharacteristicsService.isCharacteristicKey`, `CharacteristicsService.valueTypeOf` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:180` |
| `CharacteristicsService.isReducible` | 2 | `CodeService.parse`, `CodeService.reduceToUnit` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:231` |
| `CharacteristicsService.metadata` | 2 | `CharacteristicsService.map(…)`, `CharacteristicsService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:239` |
| `CharacteristicsService.tileCrossingComponentDeltaCount` | 2 | `TileCrossingComponentDeltaCountCharacteristicService.compute`, `CharacteristicContextService.createUnreduced` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:290` |
| `EndUtilitiesService.freeEndPoints` | 2 | `EndUtilitiesService.bump`, `EndUtilitiesService.position` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/end/end-utilities.service.ts:41` |
| `EndsAreLatticeNeighborsCharacteristicService.compute` | 2 | `EndUtilitiesService.freeEndPoints`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/end/ends-are-lattice-neighbors-characteristic.service.ts:51` |
| `PathUtilitiesService.walk` | 2 | `PathUtilitiesService.continuation`, `PathUtilitiesService.turnBetween` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:108` |
| `PathUtilitiesService.longestRun` | 2 | `PathUtilitiesService.findIndex(…)`, `PathUtilitiesService.neighborPairs` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:134` |
| `PathUtilitiesService.rowTouchCount` | 2 | `PathUtilitiesService.position`, `PathUtilitiesService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:177` |
| `BottomBorderTouchCountCharacteristicService.compute` | 2 | `PathUtilitiesService.rowTouchCount`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/bottom-border-touch-count-characteristic.service.ts:49` |
| `MaxMonotonicTurnLengthCharacteristicService.map(…)` | 2 | `PathUtilitiesService.longestRun`, `PathUtilitiesService.signedTurns` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/max-monotonic-turn-length-characteristic.service.ts:53` |
| `TightestTurnCountCharacteristicService.reduce(…)` | 2 | `TightestTurnCountCharacteristicService.filter(…)`, `PathUtilitiesService.neighborPairs` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/tightest-turn-count-characteristic.service.ts:53` |
| `TopBorderTouchCountCharacteristicService.compute` | 2 | `PathUtilitiesService.rowTouchCount`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/top-border-touch-count-characteristic.service.ts:49` |
| `EmbeddedUCountCharacteristicService.compute` | 2 | `EmbeddedUCountCharacteristicService.isEmbeddedU`, `EmbeddedUCountCharacteristicService.windowDigits` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/embedded/embedded-u-count-characteristic.service.ts:92` |
| `CompoundUtilitiesService.isJunctionFree` | 2 | `ForkCountCharacteristicService.compute`, `CrossCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/compound-utilities.service.ts:33` |
| `StrandUtilitiesService.hasStrandEnds` | 2 | `BettiNumber0CountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/strand-utilities.service.ts:48` |
| `StrandUtilitiesService.isFullInkWithoutDots` | 2 | `DensityCharacteristicService.compute`, `DotCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/strand-utilities.service.ts:59` |
| `IsLinesCharacteristicService.compute` | 2 | `NorthEdgeCountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-lines-characteristic.service.ts:47` |
| `IsSnakeCharacteristicService.compute` | 2 | `IsClosedLoopCharacteristicService.compute`, `DoubleHorizontalEdgeCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-snake-characteristic.service.ts:47` |
| `IsWaterfallsCharacteristicService.compute` | 2 | `IsSingleArcCharacteristicService.compute`, `MaxMonotonicTurnLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-waterfalls-characteristic.service.ts:48` |
| `LetterUtilitiesService.count` | 2 | `LetterUtilitiesService.track`, `SubmatrixUtilitiesService.countIsolatedGlyphs` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:85` |
| `LetterUtilitiesService.mapArms` | 2 | `LetterUtilitiesService.reduce(…)`, `LetterUtilitiesService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:192` |
| `LetterUtilitiesService.reduce(…)` | 2 | `LetterUtilitiesService.flipHorizontally`, `LetterUtilitiesService.flipVertically` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:216` |
| `LetterUtilitiesService.rectangular` | 2 | `LetterUtilitiesService.map(…)`, `LetterUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:245` |
| `LetterUtilitiesService.turnQuarter` | 2 | `LetterUtilitiesService.rectangular`, `LetterUtilitiesService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:262` |
| `LetterUtilitiesService.evaluators` | 2 | `LetterUtilitiesService.orientations`, `LetterUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:288` |
| `LetterUtilitiesService.flipHorizontally` | 2 | `LetterUtilitiesService.map(…)`, `LetterUtilitiesService.rectangular` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:317` |
| `LetterUtilitiesService.map(…)` | 2 | `LetterUtilitiesService.map(…)`, `LetterUtilitiesService.characters` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:318` |
| `LetterUtilitiesService.flipVertically` | 2 | `LetterUtilitiesService.map(…)`, `LetterUtilitiesService.rectangular` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:330` |
| `LetterUtilitiesService.map(…)` | 2 | `LetterUtilitiesService.map(…)`, `LetterUtilitiesService.characters` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:333` |
| `LetterUtilitiesService.orientations` | 2 | `LetterUtilitiesService.baseCorner`, `LetterUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:374` |
| `LetterUtilitiesService.turnClockwise` | 2 | `LetterUtilitiesService.reduce(…)`, `LetterUtilitiesService.rectangular` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:388` |
| `HorizontalRectangleCountCharacteristicService.compute` | 2 | `HorizontalRectangleCountCharacteristicService.countIsolatedRectangles(…)`, `RectangleUtilitiesService.countIsolatedRectangles` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/horizontal-rectangle-count-characteristic.service.ts:48` |
| `VerticalRectangleCountCharacteristicService.compute` | 2 | `VerticalRectangleCountCharacteristicService.countIsolatedRectangles(…)`, `RectangleUtilitiesService.countIsolatedRectangles` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/vertical-rectangle-count-characteristic.service.ts:48` |
| `DatabaseService.transaction(…)` | 2 | `DatabaseService.flatMap(…)`, `DatabaseService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:242` |
| `TileEnumerationService.set` | 2 | `TileEnumerationService.address`, `TileService.mark` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:141` |
| `EnumerationService.enumerate` | 2 | `EnumerationService.map(…)`, `TileEnumerationService.enumerate` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/enumeration.service.ts:98` |
| `EnumerationService.shapes` | 2 | `EnumerationService.isAdmitted`, `TileEnumerationService.maximumColumns` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/enumeration.service.ts:130` |
| `CorpusService.ingest` | 2 | `CorpusService.filter(…)`, `CorpusService.ingestOne` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:126` |
| `DrawingService.codeSegments` | 2 | `CodeService.directionsAt`, `DrawingService.pointSegments` | `projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:54` |
| `DrawingService.pointSegments` | 2 | `DrawingService.format`, `DrawingService.isBare` | `projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:95` |
| `DrawCodeService.draw` | 2 | `DatabaseService.save`, `DrawRecordService.record` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-code.service.ts:43` |
| `DrawPoolService.wave` | 2 | `DrawPoolService.flatMap(…)`, `DrawPoolService.spawn` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:132` |
| `DrawEnumerationService.drawAll` | 2 | `DrawEnumerationService.persist`, `EnumerationService.shapes` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-enumeration.service.ts:45` |
| `DrawIndexService.caption` | 2 | `DrawIndexService.filter(…)`, `DrawIndexService.escape` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:76` |
| `DrawIndexService.heldRows` | 2 | `DrawIndexService.toSorted(…)`, `DrawIndexService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:146` |
| `DrawIndexService.indexPage` | 2 | `DrawIndexService.map(…)`, `DrawIndexService.documentHead` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:163` |
| `DrawIndexService.patternPage` | 2 | `DrawIndexService.documentHead`, `DrawIndexService.shapeSections` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:213` |
| `DrawIndexService.renderFigure` | 2 | `DrawIndexService.renderBand`, `DrawIndexService.caption` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:264` |
| `DrawIndexService.build` | 2 | `DatabaseService.patternShapeCounts`, `DrawIndexService.pages` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:348` |
| `DrawIndexService.render` | 2 | `DrawIndexService.pages`, `DrawIndexService.collect` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:363` |
| `DrawCommand.runCodeDrawing` | 2 | `IncompleteCodeDrawingError.constructor`, `DrawCodeService.draw` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:142` |
| `DrawCommand.run` | 2 | `DrawCommand.drawAll`, `DrawCommand.runCodeDrawing` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:218` |
| `TileService.assertPointJoinsBelow` | 1 | `MalformedTileError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:72` |
| `TileService.blankEdges` | 1 | `TileService.grid` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:143` |
| `TileService.grid` | 1 | `TileService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:145` |
| `TileService.from(…)` | 1 | `TileService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:146` |
| `TileService.build` | 1 | `TileService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:162` |
| `TileService.from(…)` | 1 | `TileService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:167` |
| `TileService.map(…)` | 1 | `TileService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:200` |
| `TileService.map(…)` | 1 | `TileService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:203` |
| `TileService.incidentEdges` | 1 | `TileService.degree` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:218` |
| `TileService.isBare` | 1 | `TileService.degree` | `projects/meanderaw/meanderaw-cli/src/modules/tile/tile.service.ts:231` |
| `SymmetryService.image` | 1 | `SymmetryService.mapColumn` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:55` |
| `SymmetryService.from(…)` | 1 | `SymmetryService.image` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:68` |
| `SymmetryService.from(…)` | 1 | `SymmetryService.image` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:71` |
| `SymmetryService.elements` | 1 | `SymmetryService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:81` |
| `SymmetryService.from(…)` | 1 | `SymmetryService.flatMap(…)` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:82` |
| `SymmetryService.flatMap(…)` | 1 | `SymmetryService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:83` |
| `SymmetryService.map(…)` | 1 | `SymmetryService.transform` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:107` |
| `SymmetryService.flatMap(…)` | 1 | `SymmetryService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:170` |
| `SymmetryService.map(…)` | 1 | `SymmetryService.rank` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:170` |
| `SymmetryService.flatMap(…)` | 1 | `SymmetryService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:238` |
| `SymmetryService.map(…)` | 1 | `SymmetryService.edgePermutation` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:256` |
| `SymmetryService.reflections` | 1 | `SymmetryService.transform` | `projects/meanderaw/meanderaw-cli/src/modules/symmetry/symmetry.service.ts:270` |
| `CodeService.parseBare` | 1 | `CodeService.validateDigits` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:90` |
| `CodeService.parseFormatted` | 1 | `CodeService.validateDigits` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:102` |
| `CodeService.anonymous` | 1 | `CodeService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:149` |
| `CodeService.from(…)` | 1 | `CodeService.rotate` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:150` |
| `CodeService.directionsAt` | 1 | `CodeService.decode` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:181` |
| `CodeService.reduceToUnit` | 1 | `CodeService.isRepeatingUnit` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:232` |
| `CodeService.rotate` | 1 | `CodeService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:272` |
| `CodeService.spellDigits` | 1 | `CodeService.flatMap(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:313` |
| `CodeService.flatMap(…)` | 1 | `CodeService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:315` |
| `CodeService.tile` | 1 | `CodeService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:373` |
| `CodeService.from(…)` | 1 | `CodeService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:378` |
| `CodeService.from(…)` | 1 | `CodeService.directionsAt` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:379` |
| `MatrixService.extractSubmatrix` | 1 | `MatrixService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:33` |
| `MatrixService.from(…)` | 1 | `MatrixService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:42` |
| `MatrixService.from(…)` | 1 | `MatrixService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:73` |
| `MatrixService.from(…)` | 1 | `CodeService.directionsAt` | `projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:74` |
| `MatrixService.rotate` | 1 | `MatrixService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:101` |
| `MatrixService.submatrices` | 1 | `MatrixService.extractSubmatrix` | `projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:119` |
| `MatrixService.flatMap(…)` | 1 | `MatrixService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/matrix/matrix.service.ts:166` |
| `CharacteristicContextService.parse` | 1 | `CodeService.parse` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:56` |
| `GraphService.components` | 1 | `GraphService.walk` | `projects/meanderaw/meanderaw-cli/src/modules/graph/graph.service.ts:67` |
| `ConnectivityService.adjacency` | 1 | `ConnectivityService.nodes` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:61` |
| `ConnectivityService.nodes` | 1 | `ConnectivityService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:114` |
| `ConnectivityService.from(…)` | 1 | `ConnectivityService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:117` |
| `ConnectivityService.from(…)` | 1 | `ConnectivityService.key` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/connectivity/connectivity.service.ts:118` |
| `TileCrossingComponentDeltaCountCharacteristicService.compute` | 1 | `ConnectivityService.connectivity` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/tile-crossing/tile-crossing-component-delta-count-characteristic.service.ts:45` |
| `CharacteristicsService.find(…)` | 1 | `CharacteristicsService.valueTypeOf` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:84` |
| `CharacteristicsService.filter(…)` | 1 | `CharacteristicsService.isCandidateEvaluator` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:103` |
| `CharacteristicsService.flatMap(…)` | 1 | `CharacteristicsService.candidates` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:114` |
| `CharacteristicsService.map(…)` | 1 | `CharacteristicRegistryError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:126` |
| `CharacteristicsService.evaluators` | 1 | `CharacteristicsService.discover` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:146` |
| `CharacteristicsService.map(…)` | 1 | `CharacteristicsService.entry` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:222` |
| `CharacteristicsService.onApplicationBootstrap` | 1 | `CharacteristicsService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:252` |
| `TileCrossingCountCharacteristicService.compute` | 1 | `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/tile-crossing/tile-crossing-count-characteristic.service.ts:47` |
| `TileCrossingCycleCountCharacteristicService.compute` | 1 | `ConnectivityService.connectivity` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/tile-crossing/tile-crossing-cycle-count-characteristic.service.ts:45` |
| `BettiNumber0CountCharacteristicService.compute` | 1 | `ConnectivityService.connectivity` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-0-count-characteristic.service.ts:46` |
| `BettiNumber1CountCharacteristicService.compute` | 1 | `ConnectivityService.connectivity` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/betti-number-1-count-characteristic.service.ts:46` |
| `FreeEndCountCharacteristicService.compute` | 1 | `ConnectivityService.connectivity` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/topology/free-end-count-characteristic.service.ts:46` |
| `SubmatrixUtilitiesService.glyphCells` | 1 | `SubmatrixUtilitiesService.flatMap(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:53` |
| `SubmatrixUtilitiesService.digitGrid` | 1 | `SubmatrixUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:197` |
| `SubmatrixUtilitiesService.map(…)` | 1 | `SubmatrixUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:203` |
| `SubmatrixUtilitiesService.map(…)` | 1 | `SubmatrixUtilitiesService.pointDigitAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:204` |
| `SubmatrixUtilitiesService.glyphFormula` | 1 | `SubmatrixUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:216` |
| `SubmatrixUtilitiesService.map(…)` | 1 | `SubmatrixUtilitiesService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:218` |
| `SubmatrixUtilitiesService.glyphWindow` | 1 | `SubmatrixUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/submatrix-utilities.service.ts:234` |
| `InkPointCountCharacteristicService.compute` | 1 | `PointUtilitiesService.armCount` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/ink-point-count-characteristic.service.ts:45` |
| `DensityCharacteristicService.compute` | 1 | `InkPointCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/density-characteristic.service.ts:46` |
| `DotCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/dot-count-characteristic.service.ts:44` |
| `DoubleHorizontalEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/double-horizontal-edge-count-characteristic.service.ts:47` |
| `DoubleVerticalEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/double-vertical-edge-count-characteristic.service.ts:47` |
| `EastEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithArm` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/east-edge-count-characteristic.service.ts:46` |
| `EdgeCountCharacteristicService.compute` | 1 | `PointUtilitiesService.armCount` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/edge-count-characteristic.service.ts:48` |
| `NorthEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithArm` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/north-edge-count-characteristic.service.ts:46` |
| `SouthEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithArm` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/south-edge-count-characteristic.service.ts:46` |
| `WestEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithArm` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/point/west-edge-count-characteristic.service.ts:46` |
| `PathUtilitiesService.continuation` | 1 | `PathUtilitiesService.find(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:39` |
| `PathUtilitiesService.find(…)` | 1 | `PathUtilitiesService.opposite` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:47` |
| `PathUtilitiesService.neighborPairs` | 1 | `PathUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:154` |
| `PathUtilitiesService.signedTurns` | 1 | `PathUtilitiesService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/path-utilities.service.ts:197` |
| `ReversesAtItsTightestTurnCharacteristicService.checkFinalLoopTurn` | 1 | `ReversesAtItsTightestTurnCharacteristicService.applyTurn` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:134` |
| `ReversesAtItsTightestTurnCharacteristicService.findStartNode` | 1 | `ReversesAtItsTightestTurnCharacteristicService.getNeighbors` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:171` |
| `ReversesAtItsTightestTurnCharacteristicService.getDirection` | 1 | `ReversesAtItsTightestTurnCharacteristicService.parseKey` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:197` |
| `ReversesAtItsTightestTurnCharacteristicService.isJunctionFree` | 1 | `PointUtilitiesService.armCount` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:223` |
| `ReversesAtItsTightestTurnCharacteristicService.tracePaths` | 1 | `ReversesAtItsTightestTurnCharacteristicService.traceSinglePath` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/reverses-at-its-tightest-turn-characteristic.service.ts:242` |
| `TotalTurnCountCharacteristicService.reduce(…)` | 1 | `PathUtilitiesService.signedTurns` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/path/turn/total-turn-count-characteristic.service.ts:52` |
| `NorthEastCornerCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/corner/north-east-corner-count-characteristic.service.ts:46` |
| `NorthWestCornerCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/corner/north-west-corner-count-characteristic.service.ts:46` |
| `SouthEastCornerCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/corner/south-east-corner-count-characteristic.service.ts:46` |
| `SouthWestCornerCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/corner/south-west-corner-count-characteristic.service.ts:46` |
| `CrossCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/cross/cross-count-characteristic.service.ts:45` |
| `EmbeddedUCountCharacteristicService.windowDigits` | 1 | `SubmatrixUtilitiesService.pointDigitAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/embedded/embedded-u-count-characteristic.service.ts:72` |
| `EastForkCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/fork/east-fork-count-characteristic.service.ts:46` |
| `NorthForkCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/fork/north-fork-count-characteristic.service.ts:46` |
| `SouthForkCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/fork/south-fork-count-characteristic.service.ts:46` |
| `WestForkCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/fork/west-fork-count-characteristic.service.ts:46` |
| `RunUtilitiesService.longestHorizontalRunLength` | 1 | `RunUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/run/run-utilities.service.ts:67` |
| `RunUtilitiesService.map(…)` | 1 | `RunUtilitiesService.longestRowRunLength` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/run/run-utilities.service.ts:74` |
| `RunUtilitiesService.longestVerticalRunLength` | 1 | `RunUtilitiesService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/run/run-utilities.service.ts:84` |
| `RunUtilitiesService.from(…)` | 1 | `RunUtilitiesService.longestColumnRunLength` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/run/run-utilities.service.ts:91` |
| `LongestHorizontalRunLengthCharacteristicService.compute` | 1 | `RunUtilitiesService.longestHorizontalRunLength` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/run/longest-horizontal-run-length-characteristic.service.ts:46` |
| `LongestVerticalRunLengthCharacteristicService.compute` | 1 | `RunUtilitiesService.longestVerticalRunLength` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/run/longest-vertical-run-length-characteristic.service.ts:46` |
| `IsDotsCharacteristicService.compute` | 1 | `InkPointCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/compound/pattern/is-dots-characteristic.service.ts:43` |
| `LetterUtilitiesService.characters` | 1 | `LetterUtilitiesService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:74` |
| `LetterUtilitiesService.description` | 1 | `LetterUtilitiesService.drawing` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:109` |
| `LetterUtilitiesService.compute` | 1 | `LetterUtilitiesService.count` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:151` |
| `LetterUtilitiesService.parse` | 1 | `LetterUtilitiesService.isTurn` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:234` |
| `LetterUtilitiesService.from(…)` | 1 | `LetterUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:265` |
| `LetterUtilitiesService.map(…)` | 1 | `LetterUtilitiesService.mapArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:267` |
| `LetterUtilitiesService.map(…)` | 1 | `LetterUtilitiesService.evaluator` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:304` |
| `LetterUtilitiesService.map(…)` | 1 | `LetterUtilitiesService.mapArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:321` |
| `LetterUtilitiesService.map(…)` | 1 | `LetterUtilitiesService.mapArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:335` |
| `LetterUtilitiesService.formEvaluators` | 1 | `LetterUtilitiesService.flatMap(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:349` |
| `LetterUtilitiesService.flatMap(…)` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:352` |
| `LetterUtilitiesService.map(…)` | 1 | `LetterUtilitiesService.orientation` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:379` |
| `LetterUtilitiesService.reduce(…)` | 1 | `LetterUtilitiesService.turnQuarter` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/letter-utilities.service.ts:394` |
| `ALatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/a-latin-letter-characteristics.service.ts:26` |
| `AinArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/ain-arabic-letter-characteristics.service.ts:21` |
| `AlefArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/alef-arabic-letter-characteristics.service.ts:22` |
| `AoHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/ao-hanzi-letter-characteristics.service.ts:26` |
| `BLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/b-latin-letter-characteristics.service.ts:26` |
| `BehArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/beh-arabic-letter-characteristics.service.ts:21` |
| `CLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/c-latin-letter-characteristics.service.ts:25` |
| `DalArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/dal-arabic-letter-characteristics.service.ts:21` |
| `DaletHebrewLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/dalet-hebrew-letter-characteristics.service.ts:25` |
| `DeltaGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/delta-greek-letter-characteristics.service.ts:28` |
| `ELatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/e-latin-letter-characteristics.service.ts:26` |
| `FLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/f-latin-letter-characteristics.service.ts:26` |
| `FehArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/feh-arabic-letter-characteristics.service.ts:21` |
| `GanHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/gan-hanzi-letter-characteristics.service.ts:26` |
| `HLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/h-latin-letter-characteristics.service.ts:26` |
| `HahArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/hah-arabic-letter-characteristics.service.ts:21` |
| `HehArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/heh-arabic-letter-characteristics.service.ts:23` |
| `ILatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/i-latin-letter-characteristics.service.ts:25` |
| `JiaHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/jia-hanzi-letter-characteristics.service.ts:27` |
| `JingHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/jing-hanzi-letter-characteristics.service.ts:27` |
| `KafArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/kaf-arabic-letter-characteristics.service.ts:21` |
| `KappaGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/kappa-greek-letter-characteristics.service.ts:29` |
| `KieukHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/kieuk-hangul-letter-characteristics.service.ts:26` |
| `LLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/l-latin-letter-characteristics.service.ts:25` |
| `LamArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/lam-arabic-letter-characteristics.service.ts:21` |
| `LambdaGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/lambda-greek-letter-characteristics.service.ts:27` |
| `LamedHebrewLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/lamed-hebrew-letter-characteristics.service.ts:27` |
| `MLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/m-latin-letter-characteristics.service.ts:26` |
| `MeemArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/meem-arabic-letter-characteristics.service.ts:23` |
| `MuHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/mu-hanzi-letter-characteristics.service.ts:27` |
| `NLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/n-latin-letter-characteristics.service.ts:26` |
| `NoonArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/noon-arabic-letter-characteristics.service.ts:21` |
| `OLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/o-latin-letter-characteristics.service.ts:24` |
| `OmegaGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/omega-greek-letter-characteristics.service.ts:26` |
| `PhiGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/phi-greek-letter-characteristics.service.ts:28` |
| `PieupHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/pieup-hangul-letter-characteristics.service.ts:25` |
| `PsiGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/psi-greek-letter-characteristics.service.ts:27` |
| `QafArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/qaf-arabic-letter-characteristics.service.ts:21` |
| `RehArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/reh-arabic-letter-characteristics.service.ts:21` |
| `RhoGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/rho-greek-letter-characteristics.service.ts:26` |
| `SLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/s-latin-letter-characteristics.service.ts:26` |
| `SadArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/sad-arabic-letter-characteristics.service.ts:21` |
| `SeenArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/seen-arabic-letter-characteristics.service.ts:21` |
| `ShangHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/shang-hanzi-letter-characteristics.service.ts:27` |
| `ShenHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/shen-hanzi-letter-characteristics.service.ts:28` |
| `SigmaGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/sigma-greek-letter-characteristics.service.ts:28` |
| `TLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/t-latin-letter-characteristics.service.ts:25` |
| `TahArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/tah-arabic-letter-characteristics.service.ts:21` |
| `TavHebrewLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/tav-hebrew-letter-characteristics.service.ts:25` |
| `TianHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/tian-hanzi-letter-characteristics.service.ts:26` |
| `TuHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/tu-hanzi-letter-characteristics.service.ts:26` |
| `TuSoilHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/tu-soil-hanzi-letter-characteristics.service.ts:27` |
| `ULatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/u-latin-letter-characteristics.service.ts:25` |
| `WLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/w-latin-letter-characteristics.service.ts:26` |
| `WangHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/wang-hanzi-letter-characteristics.service.ts:26` |
| `WawArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/waw-arabic-letter-characteristics.service.ts:21` |
| `XLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/x-latin-letter-characteristics.service.ts:25` |
| `YLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/y-latin-letter-characteristics.service.ts:26` |
| `YaHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/ya-hangul-letter-characteristics.service.ts:27` |
| `YehArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/yeh-arabic-letter-characteristics.service.ts:21` |
| `YeoHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/yeo-hangul-letter-characteristics.service.ts:27` |
| `YoHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/yo-hangul-letter-characteristics.service.ts:25` |
| `YouHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/you-hanzi-letter-characteristics.service.ts:27` |
| `YuHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/yu-hangul-letter-characteristics.service.ts:25` |
| `YuKatakanaLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/yu-katakana-letter-characteristics.service.ts:25` |
| `ZLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/letter/z-latin-letter-characteristics.service.ts:26` |
| `RectangleUtilitiesService.from(…)` | 1 | `SubmatrixUtilitiesService.pointDigitAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:80` |
| `RectangleUtilitiesService.from(…)` | 1 | `SubmatrixUtilitiesService.pointDigitAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:87` |
| `RectangleUtilitiesService.sideLength` | 1 | `SubmatrixUtilitiesService.pointDigitAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:112` |
| `RectangleUtilitiesService.countIsolatedRectangles` | 1 | `RectangleUtilitiesService.isIsolatedRectangleAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/submatrix/rectangle/rectangle-utilities.service.ts:158` |
| `DatabaseService.codes` | 1 | `DatabaseService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:83` |
| `DatabaseService.patternShapeCounts` | 1 | `DatabaseService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:154` |
| `DatabaseService.flatMap(…)` | 1 | `DatabaseService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:249` |
| `DatabaseService.map(…)` | 1 | `DatabaseService.persistentValue` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:250` |
| `DatabaseService.map(…)` | 1 | `DatabaseService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:253` |
| `TileEnumerationService.byteTables` | 1 | `TileEnumerationService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:109` |
| `TileEnumerationService.from(…)` | 1 | `TileEnumerationService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:112` |
| `TileEnumerationService.isAdmitted` | 1 | `TileEnumerationService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:193` |
| `TileEnumerationService.isMatching` | 1 | `TileService.incidentEdges` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:213` |
| `TileEnumerationService.map(…)` | 1 | `TileEnumerationService.byteTables` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:265` |
| `TileEnumerationService.every(…)` | 1 | `TileEnumerationService.image` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:269` |
| `EnumerationService.map(…)` | 1 | `CodeService.spell` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/enumeration.service.ts:101` |
| `EnumerationService.isAdmitted` | 1 | `TileEnumerationService.isAdmitted` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/enumeration.service.ts:109` |
| `CorpusService.canonicalPhase(…)` | 1 | `CharacteristicsService.tileCrossingComponentDeltaCount` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:79` |
| `CorpusService.symmetricalCodes(…)` | 1 | `CharacteristicsService.tileCrossingComponentDeltaCount` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:106` |
| `CorpusService.filter(…)` | 1 | `CorpusService.isPreserved` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:127` |
| `CorpusService.isPreserved` | 1 | `TileEnumerationService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:143` |
| `GeometryService.borderPath` | 1 | `GeometryService.formatCoordinate` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/geometry.service.ts:40` |
| `SvgService.render` | 1 | `SvgService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/svg/svg.service.ts:27` |
| `DrawingService.format` | 1 | `GeometryService.formatCoordinate` | `projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:85` |
| `DrawRecordService.scoreTileCrossing` | 1 | `CharacteristicsService.tileCrossingComponentDeltaCount` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-record.service.ts:57` |
| `DrawWorkerService.records` | 1 | `DrawWorkerService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-worker.service.ts:48` |
| `DrawPoolService.draw` | 1 | `DrawPoolService.anonymous` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:80` |
| `DrawPoolService.onMessage` | 1 | `DrawWorkerError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:89` |
| `DrawPoolService.spawn` | 1 | `DrawPoolService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:110` |
| `DrawPoolService.flatMap(…)` | 1 | `DrawPoolService.draw` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:138` |
| `DrawPoolService.close` | 1 | `DrawPoolService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:205` |
| `DrawPoolService.onModuleDestroy` | 1 | `DrawPoolService.close` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-pool.service.ts:213` |
| `DrawIndexService.format` | 1 | `GeometryService.formatCoordinate` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:124` |
| `DrawIndexService.map(…)` | 1 | `DrawIndexService.reduce(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:193` |
| `DrawIndexService.renderRepeats` | 1 | `DrawIndexService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:269` |
| `DrawIndexService.from(…)` | 1 | `DrawIndexService.format` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:272` |
| `DrawIndexService.shapeHead` | 1 | `DrawIndexService.sectionHead` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:286` |
| `DrawIndexService.rows` | 1 | `DatabaseService.patternRows` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:355` |
| `DrawIndexService.rows` | 1 | `DrawIndexService.heldRows` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw-index.service.ts:383` |
| `DrawCommand.writePages` | 1 | `DrawIndexService.build` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:168` |
| `bootstrap` | 1 | `on(…)` | `projects/meanderaw/meanderaw-cli/src/worker.ts:24` |
| `on(…)` | 1 | `DrawWorkerService.records` | `projects/meanderaw/meanderaw-cli/src/worker.ts:36` |

</details>
<!-- callidescope:end -->
