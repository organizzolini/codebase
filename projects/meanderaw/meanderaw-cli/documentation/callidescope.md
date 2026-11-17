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
🚀 DrawCommand.run(_passedParameters: string[], options: DrawCommandOptions): Promise<void> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:163]
   ↳ Draws every meander into the database when no Code is named, or draws the one `--code` names.
  └─> DrawCommand.drawAll(): Promise<void> [projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:66]
     ↳ Draws every meander, after clearing the existing rows. The hardcoded corpus goes first, so its rows keep their Codes.
    └─> DrawEnumerationService.drawAll(): Promise<number> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/enumeration/draw-enumeration.service.ts:38]
       ↳ Every shape the budget admits, drawn and written — which is what `draw` with no drawing named now does.
      └─> DrawEnumerationService.persist(shapes: readonly MeanderShape[]): Promise<number> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/enumeration/draw-enumeration.service.ts:46]
         ↳ Draws the shapes and writes every meander they hold, a batch at a time. Skips any Code a hardcoded row already holds.
        └─> DrawPoolService.batches(shape: MeanderShape): AsyncGenerator<readonly MeanderRecord[]> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:163]
           ↳ Every meander of one shape as database rows, one per symmetry class. At most two waves are held at once.
          └─> DrawWorkerService.records(shape: MeanderShape, masks: readonly number[]): MeanderRecord[] [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-worker.service.ts:44]
             ↳ Every mask's meander as an enumerated row, in the order the masks were given.
            └─> DrawWorkerService.map(…)(mask: number): MeanderRecord [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-worker.service.ts:45]
              └─> DrawRecordService.record(…): MeanderRecord [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/enumeration/draw-record.service.ts:35]
                 ↳ The row one Code describes at one shape, every field of it derived from that Code alone.
                └─> CharacteristicsService.compute(code: Code | CodeObject): Characteristics [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:203]
                   ↳ Every characteristic of a Code's repeating unit, computed by every evaluator from one shared context.
                  └─> CharacteristicContextService.create(code: Code | CodeObject): CharacteristicContext [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:61]
                     ↳ Builds the context for the repeating unit of a formatted Code string or an already parsed Code.
                    └─> CharacteristicContextService.build(code: CodeObject): CharacteristicContext [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:34]
                       ↳ Builds the context for exactly the Code given, with its digits re-spelled from its decoded matrix.
                      └─> MatrixService.fromCode(code: Code | CodeObject, rows?: number, columns?: number): Matrix [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:65]
                         ↳ Converts a meander Code string (self-contained formatted or bare hexadecimal digits with dimensions) or a `CodeObject`…
                        └─> CodeService.parse(code: Code, rows?: number, columns?: number): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:176]
                           ↳ Reads `code` as a self-contained string or bare hexadecimal digits at `rows` and `columns`, refusing a length or…
                          └─> CodeService.parseFormatted(match: RegExpExecArray): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:77]
                             ↳ Parses a self-contained code string match into a `CodeObject`.
                            └─> CodeService.validateDigits(digits: string, rows: number, columns: number): void [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:100]
                               ↳ Validates that digits match expected length for the shape and are valid hexadecimal.
                              └─> InvalidCodeLengthError.constructor(code: string, rows: number, columns: number): InvalidCodeLengthError [projects/meanderaw/meanderaw-cli/src/modules/code/code.constants.ts:47]
```

**2. `AinArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 AinArabicLetterCharacteristicsService.constructor(…): AinArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/ain-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**3. `AlefArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 AlefArabicLetterCharacteristicsService.constructor(…): AlefArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/alef-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

<details>
<summary>109 more call stacks</summary>

**4. `BehArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 BehArabicLetterCharacteristicsService.constructor(…): BehArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/beh-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**5. `DalArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 DalArabicLetterCharacteristicsService.constructor(…): DalArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/dal-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**6. `FehArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 FehArabicLetterCharacteristicsService.constructor(…): FehArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/feh-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**7. `HahArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 HahArabicLetterCharacteristicsService.constructor(…): HahArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/hah-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**8. `HehArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 HehArabicLetterCharacteristicsService.constructor(…): HehArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/heh-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**9. `KafArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 KafArabicLetterCharacteristicsService.constructor(…): KafArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/kaf-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**10. `LamArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 LamArabicLetterCharacteristicsService.constructor(…): LamArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/lam-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**11. `MeemArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 MeemArabicLetterCharacteristicsService.constructor(…): MeemArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/meem-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**12. `NoonArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 NoonArabicLetterCharacteristicsService.constructor(…): NoonArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/noon-arabic-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**13. `QafArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 QafArabicLetterCharacteristicsService.constructor(…): QafArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/qaf-arabic-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**14. `RehArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 RehArabicLetterCharacteristicsService.constructor(…): RehArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/reh-arabic-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**15. `SadArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 SadArabicLetterCharacteristicsService.constructor(…): SadArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/sad-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**16. `SeenArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 SeenArabicLetterCharacteristicsService.constructor(…): SeenArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/seen-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**17. `TahArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 TahArabicLetterCharacteristicsService.constructor(…): TahArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/tah-arabic-letter-characteristics.service.ts:20]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**18. `WawArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 WawArabicLetterCharacteristicsService.constructor(…): WawArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/waw-arabic-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**19. `YehArabicLetterCharacteristicsService.constructor`** — depth ≥ 14 · orphan-root

```text
🚀 YehArabicLetterCharacteristicsService.constructor(…): YehArabicLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/yeh-arabic-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.formEvaluators(forms: readonly LetterDefinition[]): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322]
     ↳ Evaluators of a letter with several base templates, such as an Arabic letter's positional forms.
    └─> LetterUtilitiesService.flatMap(…)(…): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325]
      └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
         ↳ A letter's sixteen evaluators, one per orientation.
        └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
           ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
          └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
            └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
               ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
              └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
                 ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
                └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
                  └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                     ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                    └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                      └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                        └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                           ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                          └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**20. `bootstrap`** — depth ≥ 13 · orphan-root

```text
🚀 bootstrap(): Promise<void> [projects/meanderaw/meanderaw-cli/src/worker.ts:18]
   ↳ Entry point of one worker thread: boots `DrawWorkerModule`, then draws each batch sent to it.
  └─> on(…)(task: DrawWorkerTask): void [projects/meanderaw/meanderaw-cli/src/worker.ts:30]
    └─> DrawWorkerService.records(shape: MeanderShape, masks: readonly number[]): MeanderRecord[] [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-worker.service.ts:44]
       ↳ Every mask's meander as an enumerated row, in the order the masks were given.
      └─> DrawWorkerService.map(…)(mask: number): MeanderRecord [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-worker.service.ts:45]
        └─> DrawRecordService.record(…): MeanderRecord [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/enumeration/draw-record.service.ts:35]
           ↳ The row one Code describes at one shape, every field of it derived from that Code alone.
          └─> CharacteristicsService.compute(code: Code | CodeObject): Characteristics [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:203]
             ↳ Every characteristic of a Code's repeating unit, computed by every evaluator from one shared context.
            └─> CharacteristicContextService.create(code: Code | CodeObject): CharacteristicContext [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:61]
               ↳ Builds the context for the repeating unit of a formatted Code string or an already parsed Code.
              └─> CharacteristicContextService.build(code: CodeObject): CharacteristicContext [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:34]
                 ↳ Builds the context for exactly the Code given, with its digits re-spelled from its decoded matrix.
                └─> MatrixService.fromCode(code: Code | CodeObject, rows?: number, columns?: number): Matrix [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:65]
                   ↳ Converts a meander Code string (self-contained formatted or bare hexadecimal digits with dimensions) or a `CodeObject`…
                  └─> CodeService.parse(code: Code, rows?: number, columns?: number): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:176]
                     ↳ Reads `code` as a self-contained string or bare hexadecimal digits at `rows` and `columns`, refusing a length or…
                    └─> CodeService.parseFormatted(match: RegExpExecArray): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:77]
                       ↳ Parses a self-contained code string match into a `CodeObject`.
                      └─> CodeService.validateDigits(digits: string, rows: number, columns: number): void [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:100]
                         ↳ Validates that digits match expected length for the shape and are valid hexadecimal.
                        └─> InvalidCodeLengthError.constructor(code: string, rows: number, columns: number): InvalidCodeLengthError [projects/meanderaw/meanderaw-cli/src/modules/code/code.constants.ts:47]
```

**21. `DeltaGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 DeltaGreekLetterCharacteristicsService.constructor(…): DeltaGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-delta-to-omega/delta-greek-letter-characteristics.service.ts:18]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**22. `KappaGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 KappaGreekLetterCharacteristicsService.constructor(…): KappaGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-delta-to-omega/kappa-greek-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**23. `LambdaGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 LambdaGreekLetterCharacteristicsService.constructor(…): LambdaGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-delta-to-omega/lambda-greek-letter-characteristics.service.ts:18]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**24. `OmegaGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 OmegaGreekLetterCharacteristicsService.constructor(…): OmegaGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-delta-to-omega/omega-greek-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**25. `PhiGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 PhiGreekLetterCharacteristicsService.constructor(…): PhiGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-phi-to-sigma/phi-greek-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**26. `PsiGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 PsiGreekLetterCharacteristicsService.constructor(…): PsiGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-phi-to-sigma/psi-greek-letter-characteristics.service.ts:24]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**27. `RhoGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 RhoGreekLetterCharacteristicsService.constructor(…): RhoGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-phi-to-sigma/rho-greek-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**28. `SigmaGreekLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 SigmaGreekLetterCharacteristicsService.constructor(…): SigmaGreekLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-phi-to-sigma/sigma-greek-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**29. `KieukHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 KieukHangulLetterCharacteristicsService.constructor(…): KieukHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/kieuk-hangul-letter-characteristics.service.ts:18]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**30. `PieupHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 PieupHangulLetterCharacteristicsService.constructor(…): PieupHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/pieup-hangul-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**31. `YaHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YaHangulLetterCharacteristicsService.constructor(…): YaHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/ya-hangul-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**32. `YeoHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YeoHangulLetterCharacteristicsService.constructor(…): YeoHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/yeo-hangul-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**33. `YoHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YoHangulLetterCharacteristicsService.constructor(…): YoHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/yo-hangul-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**34. `YuHangulLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YuHangulLetterCharacteristicsService.constructor(…): YuHangulLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/yu-hangul-letter-characteristics.service.ts:23]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**35. `AoHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 AoHanziLetterCharacteristicsService.constructor(…): AoHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/ao-hanzi-letter-characteristics.service.ts:18]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**36. `GanHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 GanHanziLetterCharacteristicsService.constructor(…): GanHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/gan-hanzi-letter-characteristics.service.ts:18]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**37. `JiaHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 JiaHanziLetterCharacteristicsService.constructor(…): JiaHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/jia-hanzi-letter-characteristics.service.ts:18]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**38. `JingHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 JingHanziLetterCharacteristicsService.constructor(…): JingHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/jing-hanzi-letter-characteristics.service.ts:18]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**39. `MuHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 MuHanziLetterCharacteristicsService.constructor(…): MuHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/mu-hanzi-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**40. `ShangHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ShangHanziLetterCharacteristicsService.constructor(…): ShangHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/shang-hanzi-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**41. `ShenHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ShenHanziLetterCharacteristicsService.constructor(…): ShenHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/shen-hanzi-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**42. `TianHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 TianHanziLetterCharacteristicsService.constructor(…): TianHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/tian-hanzi-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**43. `TuHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 TuHanziLetterCharacteristicsService.constructor(…): TuHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/tu-hanzi-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**44. `TuSoilHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 TuSoilHanziLetterCharacteristicsService.constructor(…): TuSoilHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/tu-soil-hanzi-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**45. `WangHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 WangHanziLetterCharacteristicsService.constructor(…): WangHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/wang-hanzi-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**46. `YouHanziLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YouHanziLetterCharacteristicsService.constructor(…): YouHanziLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/you-hanzi-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**47. `DaletHebrewLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 DaletHebrewLetterCharacteristicsService.constructor(…): DaletHebrewLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hebrew-katakana/dalet-hebrew-letter-characteristics.service.ts:18]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**48. `LamedHebrewLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 LamedHebrewLetterCharacteristicsService.constructor(…): LamedHebrewLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hebrew-katakana/lamed-hebrew-letter-characteristics.service.ts:18]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**49. `TavHebrewLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 TavHebrewLetterCharacteristicsService.constructor(…): TavHebrewLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hebrew-katakana/tav-hebrew-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**50. `YuKatakanaLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YuKatakanaLetterCharacteristicsService.constructor(…): YuKatakanaLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hebrew-katakana/yu-katakana-letter-characteristics.service.ts:23]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**51. `ALatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ALatinLetterCharacteristicsService.constructor(…): ALatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/a-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**52. `BLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 BLatinLetterCharacteristicsService.constructor(…): BLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/b-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**53. `CLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 CLatinLetterCharacteristicsService.constructor(…): CLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/c-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**54. `ELatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ELatinLetterCharacteristicsService.constructor(…): ELatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/e-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**55. `FLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 FLatinLetterCharacteristicsService.constructor(…): FLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/f-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**56. `HLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 HLatinLetterCharacteristicsService.constructor(…): HLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/h-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**57. `ILatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ILatinLetterCharacteristicsService.constructor(…): ILatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/i-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**58. `LLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 LLatinLetterCharacteristicsService.constructor(…): LLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/l-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**59. `MLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 MLatinLetterCharacteristicsService.constructor(…): MLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/m-latin-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**60. `NLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 NLatinLetterCharacteristicsService.constructor(…): NLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/n-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**61. `OLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 OLatinLetterCharacteristicsService.constructor(…): OLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/o-latin-letter-characteristics.service.ts:24]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**62. `SLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 SLatinLetterCharacteristicsService.constructor(…): SLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/s-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**63. `TLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 TLatinLetterCharacteristicsService.constructor(…): TLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/t-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**64. `ULatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ULatinLetterCharacteristicsService.constructor(…): ULatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/u-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**65. `WLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 WLatinLetterCharacteristicsService.constructor(…): WLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/w-latin-letter-characteristics.service.ts:19]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**66. `XLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 XLatinLetterCharacteristicsService.constructor(…): XLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/x-latin-letter-characteristics.service.ts:25]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**67. `YLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 YLatinLetterCharacteristicsService.constructor(…): YLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/y-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**68. `ZLatinLetterCharacteristicsService.constructor`** — depth ≥ 12 · orphan-root

```text
🚀 ZLatinLetterCharacteristicsService.constructor(…): ZLatinLetterCharacteristicsService [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/z-latin-letter-characteristics.service.ts:26]
  └─> LetterUtilitiesService.evaluators(definition: LetterDefinition): readonly CharacteristicEvaluator<number>[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265]
     ↳ A letter's sixteen evaluators, one per orientation.
    └─> LetterUtilitiesService.orientations(…): readonly LetterOrientation[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338]
       ↳ A base template drawn in all sixteen orientations, in `orientationNames` order.
      └─> LetterUtilitiesService.map(…)(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343]
        └─> LetterUtilitiesService.orientation(…): LetterOrientation [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190]
           ↳ A base template facing `base` drawn in the orientation `name`: flipped to its corner, then turned.
          └─> LetterUtilitiesService.turnClockwise(template: readonly string[], rotation: LetterRotation): readonly string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352]
             ↳ Turns a template clockwise by `rotation`, carrying each arm round with it; a quarter or three-quarter turn swaps its…
            └─> LetterUtilitiesService.reduce(…)(turned: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358]
              └─> LetterUtilitiesService.turnQuarter(template: readonly string[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242]
                 ↳ Turns a template one quarter clockwise: the west column becomes the top row, and each arm moves a quarter round.
                └─> LetterUtilitiesService.from(…)(_unused: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245]
                  └─> LetterUtilitiesService.map(…)(line: string): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247]
                    └─> LetterUtilitiesService.mapArms(character: string, arms: Readonly<Record<number, number>>): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174]
                       ↳ Rewrites a digit's arms through `arms`, mapping each bit (north 8, south 4, east 2, west 1); a blank `.` stays blank.
                      └─> LetterUtilitiesService.reduce(…)(sum: number, arm: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:185]
```

**69. `EnumerationService.enumerate`** — depth ≥ 11 · orphan-root

```text
🚀 EnumerationService.enumerate(shape: MeanderShape): EnumeratedMeander[] [projects/meanderaw/meanderaw-cli/src/modules/enumeration/enumeration.service.ts:56]
   ↳ Every structurally distinct meander of one shape, one per symmetry class, each spelled by its canonical…
  └─> TileEnumerationService.enumerate(rows: number, columns: number): Tile[] [projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:127]
     ↳ Every distinct tile of the given size, one per symmetry class, in canonical edge-key order.
    └─> TileEnumerationService.map(…)(mask: number): { key: string; tile: Tile; } [projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:141]
      └─> SymmetryService.canonicalTile(tile: Tile): Tile [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:171]
         ↳ The one tile of a symmetry class the corpus draws. The choice is made by {@link rank}.
        └─> SymmetryService.orbit(tile: Tile): Tile[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:85]
           ↳ Every tile the symmetry group maps `tile` to, itself included, with duplicates left in.
          └─> SymmetryService.map(…)(element: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:86]
            └─> SymmetryService.transform(tile: Tile, options: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:144]
               ↳ The tile one group element maps `tile` to.
              └─> TileService.blankEdges(shape: TileShape): EdgesDraft [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:117]
                 ↳ A tile's worth of unset edges, ready to be marked one at a time and handed to {@link build}.
                └─> TileService.grid(rowCount: number): boolean[][] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:119]
                  └─> TileService.from(…)(): boolean[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:120]
                    └─> TileService.from(…)(): boolean [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:121]
```

**70. `DrawIndexService.render`** — depth ≥ 11 · orphan-root

```text
🚀 DrawIndexService.render(meanders: readonly Meander[]): Promise<Record<string, string>> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:325]
   ↳ The same pages from rows already in memory, each read into one string — the seam a test renders a handful of meanders…
  └─> DrawIndexService.pages(source: MeanderPageSource): Record<string, MeanderPageContent> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:162]
     ↳ Every page `source`'s rows make, each produced lazily as it is read.
    └─> DrawIndexService.patternPage(…): AsyncGenerator<string, any, any> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:192]
       ↳ One pattern's page: every meander it holds for, one grid per shape, a batch of rows at a time.
      └─> DrawIndexService.shapeSections(…): AsyncGenerator<string, any, any> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:265]
         ↳ A pattern's section: one grid per shape, each with its own count. Rows arrive ordered by shape.
        └─> DrawIndexService.renderFigure(meander: Meander): string [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:229]
           ↳ Renders one meander's own figure: the band its tile repeats into, and its caption.
          └─> DrawIndexService.renderBand(meander: Meander): string [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:209]
             ↳ Lays one row's tile along a band of `BAND_REPEAT_COUNT` repeats.
            └─> DrawingService.render(code: CodeObject): string [projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:108]
               ↳ Renders a Code to a complete SVG document: `rows` units tall, `columns` units wide, with no repeat since a Code names…
              └─> DrawingService.codeSegments(geometry: Geometry, code: CodeObject): string [projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:39]
                 ↳ The path data every point of the Code draws, in reading order.
                └─> DrawingService.pointSegments(geometry: Geometry, point: Directions, origin: CanvasPoint): string [projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:80]
                   ↳ The path data one point draws: the edges it owns, or a dot where it owns none.
                  └─> DrawingService.format(value: number): string [projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:70]
                     ↳ Rounds and trims one pixel coordinate for interpolation into path data.
                    └─> GeometryService.formatCoordinate(value: number): string [projects/meanderaw/meanderaw-cli/src/modules/geometry/geometry.service.ts:52]
                       ↳ Rounds a coordinate to five decimal places and trims any trailing zeros.
```

**71. `CodeService.spellCanonical`** — depth 9 · orphan-root

```text
🚀 CodeService.spellCanonical(tile: Tile, repeats?: number): string [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:253]
   ↳ The Code every tile in a symmetry class shares: {@link spell} of the canonical member.
  └─> SymmetryService.canonicalTile(tile: Tile): Tile [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:171]
     ↳ The one tile of a symmetry class the corpus draws. The choice is made by {@link rank}.
    └─> SymmetryService.orbit(tile: Tile): Tile[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:85]
       ↳ Every tile the symmetry group maps `tile` to, itself included, with duplicates left in.
      └─> SymmetryService.map(…)(element: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:86]
        └─> SymmetryService.transform(tile: Tile, options: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:144]
           ↳ The tile one group element maps `tile` to.
          └─> TileService.blankEdges(shape: TileShape): EdgesDraft [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:117]
             ↳ A tile's worth of unset edges, ready to be marked one at a time and handed to {@link build}.
            └─> TileService.grid(rowCount: number): boolean[][] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:119]
              └─> TileService.from(…)(): boolean[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:120]
                └─> TileService.from(…)(): boolean [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:121]
```

**72. `IsForkCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsForkCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-fork-characteristic.service.ts:64]
   ↳ Checks the unit is one acyclic single-fork component with three free ends, no dots, and no comb.
  └─> IsCombCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-comb-characteristic.service.ts:57]
     ↳ Checks the unit is one straight-toothed tree with at least two forks.
    └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-0-count-characteristic.service.ts:44]
       ↳ Counts the components of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**73. `IsPureTreeCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsPureTreeCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-pure-tree-characteristic.service.ts:64]
   ↳ Checks the unit is one acyclic multi-fork component with no cross, no dots, no comb, and no arcade.
  └─> IsCombCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-comb-characteristic.service.ts:57]
     ↳ Checks the unit is one straight-toothed tree with at least two forks.
    └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-0-count-characteristic.service.ts:44]
       ↳ Counts the components of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**74. `IsSnakeCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsSnakeCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-snake-characteristic.service.ts:47]
   ↳ Checks the unit is one loop stretched along the band.
  └─> IsClosedLoopCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/structure/is-closed-loop-characteristic.service.ts:53]
     ↳ Checks the unit is one junction-free component closing one cycle with no free ends.
    └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-0-count-characteristic.service.ts:44]
       ↳ Counts the components of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**75. `IsWaterfallsCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsWaterfallsCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-waterfalls-characteristic.service.ts:48]
   ↳ Checks the unit is one arc that alternates every turn.
  └─> IsSingleArcCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/structure/is-single-arc-characteristic.service.ts:53]
     ↳ Checks the unit is one junction-free component with no cycle and two free ends.
    └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-0-count-characteristic.service.ts:44]
       ↳ Counts the components of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**76. `IsDoubleChainCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsDoubleChainCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-double-chain-characteristic.service.ts:57]
   ↳ Checks the unit is two wrapping, reversing strands at pitch `2 rows - 2`, with runs of `width - 1` and `rows - 2`.
  └─> StrandUtilitiesService.hasStrandEnds(context: CharacteristicContext, strands: number): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/strand-utilities.service.ts:48]
     ↳ Whether the unit has exactly `strands` components and two free ends per component.
    └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-0-count-characteristic.service.ts:44]
       ↳ Counts the components of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**77. `IsWhirlCharacteristicService.compute`** — depth ≥ 9 · orphan-root

```text
🚀 IsWhirlCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-whirl-characteristic.service.ts:81]
   ↳ Checks every strand winds in and back out once per row, reversing once.
  └─> IsWhirlCharacteristicService.isOpenStrandSet(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-whirl-characteristic.service.ts:68]
     ↳ Whether the ink is dot-free, junction-free, acyclic strands with two free ends each.
    └─> BettiNumber1CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-1-count-characteristic.service.ts:44]
       ↳ Counts the independent loops of the wrapped repeat graph.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**78. `DrawRecordService.scoreTileCrossing`** — depth ≥ 9 · orphan-root

```text
🚀 DrawRecordService.scoreTileCrossing(rotation: CodeObject): number [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/enumeration/draw-record.service.ts:47]
  └─> CharacteristicsService.tileCrossingComponentDeltaCount(code: Code | CodeObject): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:263]
     ↳ Tile-crossing component delta of the Code as filed, not its repeating unit: the canonical-rotation scorer compares…
    └─> TileCrossingComponentDeltaCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/tile-crossing/tile-crossing-component-delta-count-characteristic.service.ts:45]
       ↳ Subtracts the band's component count from the lone tile's.
      └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
         ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
        └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
           ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
          └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
             ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
            └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
              └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
                └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                   ↳ One point's identity in the graph, which is its position and nothing else.
```

**79. `SymmetryService.variants`** — depth 8 · orphan-root

```text
🚀 SymmetryService.variants(tile: Tile): Tile[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:225]
   ↳ Every distinct tile drawing the same pattern as `tile`, itself included.
  └─> SymmetryService.orbit(tile: Tile): Tile[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:85]
     ↳ Every tile the symmetry group maps `tile` to, itself included, with duplicates left in.
    └─> SymmetryService.map(…)(element: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:86]
      └─> SymmetryService.transform(tile: Tile, options: TransformChoice): Tile [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:144]
         ↳ The tile one group element maps `tile` to.
        └─> TileService.blankEdges(shape: TileShape): EdgesDraft [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:117]
           ↳ A tile's worth of unset edges, ready to be marked one at a time and handed to {@link build}.
          └─> TileService.grid(rowCount: number): boolean[][] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:119]
            └─> TileService.from(…)(): boolean[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:120]
              └─> TileService.from(…)(): boolean [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:121]
```

**80. `IsCrossCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsCrossCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-cross-characteristic.service.ts:54]
   ↳ Checks the unit crosses itself with no fork, loose end, or dot.
  └─> FreeEndCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/free-end-count-characteristic.service.ts:44]
     ↳ Counts the degree-one vertices of the wrapped repeat graph.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**81. `IsMeshCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsMeshCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-mesh-characteristic.service.ts:60]
   ↳ Checks the unit is crossing lines that span both directions with nothing loose.
  └─> FreeEndCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/free-end-count-characteristic.service.ts:44]
     ↳ Counts the degree-one vertices of the wrapped repeat graph.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**82. `IsLinesCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsLinesCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-lines-characteristic.service.ts:47]
   ↳ Checks the ink is horizontal only and every row wraps around the band.
  └─> BettiNumber1CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-1-count-characteristic.service.ts:44]
     ↳ Counts the independent loops of the wrapped repeat graph.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**83. `IsBoxesCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsBoxesCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-boxes-characteristic.service.ts:54]
   ↳ Checks the unit winds far more than it inflects, one hairpin per component.
  └─> BettiNumber0CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-0-count-characteristic.service.ts:44]
     ↳ Counts the components of the wrapped repeat graph.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**84. `IsChainCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsChainCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-chain-characteristic.service.ts:51]
   ↳ Checks the unit winds past its hairpins and links across the tile edge.
  └─> TileCrossingComponentDeltaCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/tile-crossing/tile-crossing-component-delta-count-characteristic.service.ts:45]
     ↳ Subtracts the band's component count from the lone tile's.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**85. `IsSwirlCharacteristicService.compute`** — depth ≥ 8 · orphan-root

```text
🚀 IsSwirlCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-swirl-characteristic.service.ts:57]
   ↳ Checks the unit winds one way for two turns per row, less two.
  └─> BettiNumber1CountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-1-count-characteristic.service.ts:44]
     ↳ Counts the independent loops of the wrapped repeat graph.
    └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
       ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
      └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
         ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
        └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
           ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
          └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
            └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
              └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
                 ↳ One point's identity in the graph, which is its position and nothing else.
```

**86. `CharacteristicsService.onApplicationBootstrap`** — depth ≥ 7 · lifecycle

```text
🚀 CharacteristicsService.onApplicationBootstrap(): void [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:230]
   ↳ Discovers and checks every evaluator at boot, so a missing, unknown, doubly claimed or mistyped key stops startup…
  └─> CharacteristicsService.evaluators(): readonly CharacteristicEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:130]
     ↳ Every evaluator in key-list order, discovering them the first time only.
    └─> CharacteristicsService.discover(): readonly CharacteristicEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:93]
       ↳ Every discovered evaluator, lone or grouped, checked against the key lists and ordered by them.
      └─> CharacteristicsService.flatMap(…)(…): readonly CandidateEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:98]
        └─> CharacteristicsService.candidates(instance: unknown): readonly CandidateEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:83]
           ↳ The evaluator candidates a discovered provider holds: itself when evaluator-shaped, or each evaluator-shaped member of…
          └─> CharacteristicsService.filter(…)(member: unknown): member is CandidateEvaluator [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:87]
            └─> CharacteristicsService.isCandidateEvaluator(value: unknown): value is CandidateEvaluator [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:137]
               ↳ Whether a discovered provider has an evaluator's shape: a `compute` method and metadata naming a string key.
```

**87. `CharacteristicsService.metadata`** — depth ≥ 7 · orphan-root

```text
🚀 CharacteristicsService.metadata(): readonly CharacteristicMetadata[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:223]
   ↳ Every registered characteristic's metadata, in key-list order.
  └─> CharacteristicsService.evaluators(): readonly CharacteristicEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:130]
     ↳ Every evaluator in key-list order, discovering them the first time only.
    └─> CharacteristicsService.discover(): readonly CharacteristicEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:93]
       ↳ Every discovered evaluator, lone or grouped, checked against the key lists and ordered by them.
      └─> CharacteristicsService.flatMap(…)(…): readonly CandidateEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:98]
        └─> CharacteristicsService.candidates(instance: unknown): readonly CandidateEvaluator[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:83]
           ↳ The evaluator candidates a discovered provider holds: itself when evaluator-shaped, or each evaluator-shaped member of…
          └─> CharacteristicsService.filter(…)(member: unknown): member is CandidateEvaluator [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:87]
            └─> CharacteristicsService.isCandidateEvaluator(value: unknown): value is CandidateEvaluator [projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:137]
               ↳ Whether a discovered provider has an evaluator's shape: a `compute` method and metadata naming a string key.
```

**88. `TileCrossingCycleCountCharacteristicService.compute`** — depth ≥ 7 · orphan-root

```text
🚀 TileCrossingCycleCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/tile-crossing/tile-crossing-cycle-count-characteristic.service.ts:45]
   ↳ Subtracts the lone tile's loop count from the band's.
  └─> ConnectivityService.connectivity(matrix: Matrix, unwrapped?: boolean): Connectivity [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99]
     ↳ How many pieces one repeat's ink falls into, how many independent loops it closes, and how many of its points terminate.
    └─> ConnectivityService.adjacency(matrix: Matrix, edges: readonly CodeEdge[]): InkAdjacency<string> [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32]
       ↳ The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it.
      └─> ConnectivityService.nodes(matrix: Matrix): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85]
         ↳ Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own.
        └─> ConnectivityService.from(…)(_unused: unknown, row: number): string[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88]
          └─> ConnectivityService.from(…)(_column: unknown, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89]
            └─> ConnectivityService.key(row: number, column: number): string [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:80]
               ↳ One point's identity in the graph, which is its position and nothing else.
```

**89. `IsParallelCharacteristicService.compute`** — depth 7 · orphan-root

```text
🚀 IsParallelCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-parallel-characteristic.service.ts:55]
   ↳ Checks the unit is junction-free strokes that turn back at most once in a row.
  └─> MaxMonotonicTurnLengthCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/max-monotonic-turn-length-characteristic.service.ts:48]
     ↳ Finds the longest same-handed run of turns over every strand.
    └─> PathUtilitiesService.strands(edges: readonly CodeEdge[]): Strand[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:195]
       ↳ Cuts one repeat's ink into strands: maximal runs through degree-two points over the cyclic band.
      └─> PathUtilitiesService.walk(graph: HalfEdgeGraph, start: HalfEdge, visited: Set<number>): Turn[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:101]
         ↳ Walks one strand from `start` until it ends or returns to an edge already walked, marking every edge it crosses.
        └─> PathUtilitiesService.continuation(graph: HalfEdgeGraph, arrival: HalfEdge): HalfEdge | undefined [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:39]
           ↳ The half-edge a strand leaves by after arriving along `arrival`, or `undefined` when it arrives at a free end or a…
          └─> PathUtilitiesService.find(…)(halfEdge: HalfEdge): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:47]
            └─> PathUtilitiesService.opposite(heading: Heading): Heading [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:75]
               ↳ The heading pointing the other way.
```

**90. `IsClaspsCharacteristicService.compute`** — depth 7 · orphan-root

```text
🚀 IsClaspsCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-clasps-characteristic.service.ts:58]
   ↳ Checks the unit is hooks that wind once per row, less one, and reverse tightly.
  └─> ReversesAtItsTightestTurnCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:309]
     ↳ Walks every strand of a junction-free Code's wrapped repeat graph, reporting whether any turn lands exactly one step…
    └─> ReversesAtItsTightestTurnCharacteristicService.tracePaths(adjacency: Map<string, string[]>, columns: number): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:234]
       ↳ Traces every disjoint path in the adjacency graph, reporting whether any of them turns tightly.
      └─> ReversesAtItsTightestTurnCharacteristicService.traceSinglePath(…): void [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:257]
         ↳ Traces a single path starting from a node.
        └─> ReversesAtItsTightestTurnCharacteristicService.advancePath(…): { currentNode: string; direction: number; nextNode: string | undefined; stepsSinceTurn: number; } [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:48]
           ↳ Advances one step along the path and updates tracking state.
          └─> ReversesAtItsTightestTurnCharacteristicService.getDirection(from: string, to: string, columns: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:189]
             ↳ Returns 0=Up, 1=Right, 2=Down, 3=Left or -1 if invalid.
            └─> ReversesAtItsTightestTurnCharacteristicService.parseKey(key: string): { column: number; row: number; } [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:225]
               ↳ Parses a node string key into column and row integers.
```

**91. `LetterUtilitiesService.compute`** — depth 7 · orphan-root

```text
🚀 LetterUtilitiesService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:137]
  └─> LetterUtilitiesService.count(…): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:73]
     ↳ The count of `template` glyphs in a context, scanned the first time any evaluator asks. `ink` is the template's rows…
    └─> SubmatrixUtilitiesService.countIsolatedGlyphs(matrix: Matrix, template: readonly string[]): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:89]
       ↳ Counts the isolated glyphs of a matrix drawn exactly as `template`, a hexadecimal-digit grid with `.` outside the glyph.
      └─> SubmatrixUtilitiesService.digitGrid(matrix: Matrix): readonly (readonly number[])[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:165]
         ↳ Every point's digit, row by row, as {@link SubmatrixUtilitiesService.pointDigitAt} spells it.
        └─> SubmatrixUtilitiesService.map(…)(points: readonly MatrixPoint[], row: number): number[] [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:171]
          └─> SubmatrixUtilitiesService.map(…)(_point: MatrixPoint, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:172]
            └─> SubmatrixUtilitiesService.pointDigitAt(matrix: Matrix, row: number, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:209]
               ↳ The hexadecimal Code digit at `(row, column)`, columns wrapping; -1 past the top or bottom row.
```

**92. `HorizontalRectangleCountCharacteristicService.compute`** — depth ≥ 6 · orphan-root

```text
🚀 HorizontalRectangleCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/horizontal-rectangle-count-characteristic.service.ts:46]
   ↳ Counts the isolated rings whose width and height compare as `w > h`.
  └─> RectangleUtilitiesService.countIsolatedRectangles(matrix: Matrix, isCounted: (width: number, height: number) => boolean): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:137]
     ↳ Counts the isolated rectangles of a matrix whose size `isCounted` accepts.
    └─> RectangleUtilitiesService.isIsolatedRectangleAt(…): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:30]
       ↳ Whether a rectangle with its north-west corner at `origin`, of a size `isCounted` accepts, closes its ring exactly.
      └─> RectangleUtilitiesService.ringCloses(…): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:69]
         ↳ Whether the bottom and right sides of a ring, with top and left at their corners, are straights meeting at a south-east…
        └─> RectangleUtilitiesService.from(…)(_unused: unknown, offset: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:76]
          └─> SubmatrixUtilitiesService.pointDigitAt(matrix: Matrix, row: number, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:209]
             ↳ The hexadecimal Code digit at `(row, column)`, columns wrapping; -1 past the top or bottom row.
```

**93. `VerticalRectangleCountCharacteristicService.compute`** — depth ≥ 6 · orphan-root

```text
🚀 VerticalRectangleCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/vertical-rectangle-count-characteristic.service.ts:46]
   ↳ Counts the isolated rings whose width and height compare as `w < h`.
  └─> RectangleUtilitiesService.countIsolatedRectangles(matrix: Matrix, isCounted: (width: number, height: number) => boolean): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:137]
     ↳ Counts the isolated rectangles of a matrix whose size `isCounted` accepts.
    └─> RectangleUtilitiesService.isIsolatedRectangleAt(…): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:30]
       ↳ Whether a rectangle with its north-west corner at `origin`, of a size `isCounted` accepts, closes its ring exactly.
      └─> RectangleUtilitiesService.ringCloses(…): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:69]
         ↳ Whether the bottom and right sides of a ring, with top and left at their corners, are straights meeting at a south-east…
        └─> RectangleUtilitiesService.from(…)(_unused: unknown, offset: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:76]
          └─> SubmatrixUtilitiesService.pointDigitAt(matrix: Matrix, row: number, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:209]
             ↳ The hexadecimal Code digit at `(row, column)`, columns wrapping; -1 past the top or bottom row.
```

**94. `IsBarsCharacteristicService.compute`** — depth 5 · orphan-root

```text
🚀 IsBarsCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-bars-characteristic.service.ts:53]
   ↳ Checks the ink is vertical only, fully inked, and spans the band.
  └─> LongestVerticalRunLengthCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/run/longest-vertical-run-length-characteristic.service.ts:46]
     ↳ Finds the longest vertical run over every column.
    └─> RunUtilitiesService.longestVerticalRunLength(matrix: Matrix): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/run/run-utilities.service.ts:80]
       ↳ The longest vertical run of ink in the Code. Rows do not wrap; the first and last sit against the border rules.
      └─> RunUtilitiesService.from(…)(_unused: unknown, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/run/run-utilities.service.ts:87]
        └─> RunUtilitiesService.longestColumnRunLength(matrix: Matrix, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/run/run-utilities.service.ts:24]
           ↳ The longest straight run of ink in `column`, reading each row's south arm directly and never wrapping across rows.
```

**95. `TileService.assertWellFormed`** — depth ≥ 4 · orphan-root

```text
🚀 TileService.assertWellFormed(tile: Tile): void [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:94]
   ↳ Refuses a grid of direction bits that is not a tile. Its east-west wrap makes a tile join with its next repeat.
  └─> TileService.assertPointAgrees(tile: Tile, row: number, column: number): void [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:36]
     ↳ Refuses one point whose bits disagree with its neighbors'. Called only from {@link assertWellFormed}.
    └─> TileService.assertPointJoinsBelow(point: Directions, below: Directions | undefined, at: TilePoint): void [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:58]
       ↳ Refuses one point whose southward bit the point below does not answer, or whose north is claimed where the cap tick…
      └─> MalformedTileError.constructor(reason: string): MalformedTileError [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.constants.ts:19]
```

**96. `CodeService.anonymous`** — depth 4 · orphan-root

```text
🚀 CodeService.anonymous(c: CodeObject): CodeObject[] [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:121]
  └─> CodeService.from(…)(_: unknown, index: number): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:122]
    └─> CodeService.rotate(code: CodeObject, shift: number): CodeObject [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:223]
       ↳ The Code shifted `shift` columns west, wrapping each row. A shift rotates the repeat without changing the pattern.
      └─> CodeService.from(…)(_unused: unknown, row: number): string [projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:226]
```

**97. `MatrixService.submatrices`** — depth 4 · orphan-root

```text
🚀 MatrixService.submatrices(matrix: Matrix, height: number, width: number): Submatrix[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:118]
   ↳ Extracts sliding submatrix kernels of size `height x width` over the matrix with horizontal column wrapping.
  └─> MatrixService.extractSubmatrix(…): MatrixPoint[][] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:33]
     ↳ Extracts a 2D submatrix kernel starting at the given origin with the specified size.
    └─> MatrixService.from(…)(_unusedRow: unknown, deltaRow: number): MatrixPoint[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:42]
      └─> MatrixService.from(…)(_unusedColumn: unknown, deltaColumn: number): MatrixPoint [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:47]
```

**98. `DrawPoolService.onModuleDestroy`** — depth 3 · lifecycle

```text
🚀 DrawPoolService.onModuleDestroy(): Promise<void> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:190]
   ↳ Ends the pool's threads with the application, so none outlives it.
  └─> DrawPoolService.close(): Promise<void> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:182]
     ↳ Ends every thread the pool spawned; the next shape spawns fresh ones.
    └─> DrawPoolService.map(…)(worker: Worker): Promise<number> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:186]
```

**99. `MatrixService.toCode`** — depth 3 · orphan-root

```text
🚀 MatrixService.toCode(matrix: Matrix, repeats?: number): Code [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:156]
   ↳ Encodes a 2D Matrix back into a formatted meander Code string.
  └─> MatrixService.flatMap(…)(this: undefined, row: readonly MatrixPoint[]): string[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:165]
    └─> MatrixService.map(…)(point: MatrixPoint): string [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:166]
```

**100. `BottomBorderTouchCountCharacteristicService.compute`** — depth 3 · orphan-root

```text
🚀 BottomBorderTouchCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/border-touch/bottom-border-touch-count-characteristic.service.ts:49]
   ↳ Counts the separate runs of ink on the last row.
  └─> PathUtilitiesService.rowTouchCount(edges: readonly CodeEdge[], row: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:168]
     ↳ Separate runs of ink touching `row`, joined by eastward edges and wrapping across the tile.
    └─> PathUtilitiesService.position(key: string): { column: number; row: number; } [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:84]
       ↳ The row and column a `row,column` point key names.
```

**101. `TopBorderTouchCountCharacteristicService.compute`** — depth 3 · orphan-root

```text
🚀 TopBorderTouchCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/border-touch/top-border-touch-count-characteristic.service.ts:49]
   ↳ Counts the separate runs of ink on the first row.
  └─> PathUtilitiesService.rowTouchCount(edges: readonly CodeEdge[], row: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:168]
     ↳ Separate runs of ink touching `row`, joined by eastward edges and wrapping across the tile.
    └─> PathUtilitiesService.position(key: string): { column: number; row: number; } [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:84]
       ↳ The row and column a `row,column` point key names.
```

**102. `EmbeddedUCountCharacteristicService.compute`** — depth 3 · orphan-root

```text
🚀 EmbeddedUCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/embedded/embedded-u-count-characteristic.service.ts:88]
   ↳ Counts every 2×2 window whose ink forms a U in any rotation.
  └─> EmbeddedUCountCharacteristicService.windowDigits(…): { bl: number; br: number; tl: number; tr: number; } [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/embedded/embedded-u-count-characteristic.service.ts:68]
     ↳ Every 2×2 window's four digits, read without wrapping past the last row.
    └─> SubmatrixUtilitiesService.pointDigitAt(matrix: Matrix, row: number, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:209]
       ↳ The hexadecimal Code digit at `(row, column)`, columns wrapping; -1 past the top or bottom row.
```

**103. `IsDotsCharacteristicService.compute`** — depth 3 · orphan-root

```text
🚀 IsDotsCharacteristicService.compute(context: CharacteristicContext): boolean [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-dots-characteristic.service.ts:43]
   ↳ Checks no point of the unit is inked.
  └─> InkPointCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/ink-counts/ink-point-count-characteristic.service.ts:45]
     ↳ Counts the points that carry at least one arm.
    └─> PointUtilitiesService.armCount(point: MatrixPoint): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/point-utilities.service.ts:27]
       ↳ How many of a point's four arms carry ink, read off its digit.
```

**104. `TileEnumerationService.isMatching`** — depth 3 · orphan-root

```text
🚀 TileEnumerationService.isMatching(tile: Tile): boolean [projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:163]
   ↳ Whether every point of a tile touches at most one edge (the retired `mosaic` exact-cover rule).
  └─> TileService.incidentEdges(tile: Tile, row: number, column: number): number [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:175]
     ↳ Distinct edges touching a point. Differs from {@link degree} only at one column, where an eastward edge loops back.
    └─> TileService.degree(directions: Directions): number [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:152]
       ↳ A point's degree: how many of its four direction bits are set. A dot is 0, a corner 2, a crossing 4.
```

**105. `DrawIndexService.rows`** — depth 3 · orphan-root

```text
🚀 DrawIndexService.rows(…): (readonly Meander[])[] [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:345]
  └─> DrawIndexService.heldRows(…): (readonly Meander[])[] [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:125]
     ↳ A pattern's rows already in memory, in the order its page lists them.
    └─> DrawIndexService.toSorted(…)(left: Meander, right: Meander): number [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:132]
```

**106. `TileService.isBare`** — depth 2 · orphan-root

```text
🚀 TileService.isBare(directions: Directions): boolean [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:188]
   ↳ Whether a point carries no ink at all, and so draws a dot.
  └─> TileService.degree(directions: Directions): number [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:152]
     ↳ A point's degree: how many of its four direction bits are set. A dot is 0, a corner 2, a crossing 4.
```

**107. `MatrixService.rotate`** — depth 2 · orphan-root

```text
🚀 MatrixService.rotate(matrix: Matrix, step: number): Matrix [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:100]
   ↳ Shifts/rotates columns of the matrix by `step` positions westward with cyclic column wrapping.
  └─> MatrixService.map(…)(row: readonly MatrixPoint[]): MatrixPoint[] [projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:112]
```

**108. `SouthEdgeCountCharacteristicService.compute`** — depth 2 · orphan-root

```text
🚀 SouthEdgeCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/directional-edge-counts/south-edge-count-characteristic.service.ts:46]
   ↳ Counts the points with a south arm.
  └─> SubmatrixUtilitiesService.countPointsWithArm(matrix: Matrix, arm: MatrixPointArm): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:117]
     ↳ Counts the points whose ink leaves by `arm`, whatever other arms they carry. This is every directional edge count.
```

**109. `WestEdgeCountCharacteristicService.compute`** — depth 2 · orphan-root

```text
🚀 WestEdgeCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/directional-edge-counts/west-edge-count-characteristic.service.ts:46]
   ↳ Counts the points with a west arm.
  └─> SubmatrixUtilitiesService.countPointsWithArm(matrix: Matrix, arm: MatrixPointArm): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:117]
     ↳ Counts the points whose ink leaves by `arm`, whatever other arms they carry. This is every directional edge count.
```

**110. `DoubleVerticalEdgeCountCharacteristicService.compute`** — depth 2 · orphan-root

```text
🚀 DoubleVerticalEdgeCountCharacteristicService.compute(context: CharacteristicContext): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/edge-counts/double-vertical-edge-count-characteristic.service.ts:47]
   ↳ Counts the points whose only arms are north and south.
  └─> SubmatrixUtilitiesService.countPointsWithExactArms(matrix: Matrix, arms: readonly MatrixPointArm[]): number [projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:135]
     ↳ Counts the points whose ink leaves by exactly `arms`, every other arm clear.
```

**111. `DrawPoolService.onMessage`** — depth ≥ 2 · orphan-root

```text
🚀 DrawPoolService.onMessage(reply: DrawWorkerReply): void [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:74]
  └─> DrawWorkerError.constructor(message: string): DrawWorkerError [projects/meanderaw/meanderaw-cli/src/modules/draw/draw.constants.ts:15]
```

**112. `DrawIndexService.rows`** — depth 2 · orphan-root

```text
🚀 DrawIndexService.rows(…): AsyncGenerator<Meander[], any, any> [projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:317]
  └─> DatabaseService.patternRows(key: PatternCharacteristicKey, batchSize?: number): AsyncGenerator<Meander[]> [projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:94]
     ↳ The rows one pattern characteristic holds for, `batchSize` at a time, in page order. Each batch resumes after the last.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CorpusService.ingestOne` | 12 | `CodeService.parse`, `CorpusService.canonicalRotation(…)`, `CodeService.canonicalRotation`, `CharacteristicsService.compute`, `CharacteristicsService.isReducible`, `CodeService.format`, `DatabaseService.findOneByCode`, `DatabaseService.save`, `CharacteristicsService.stored`, `CorpusService.symmetricalCodes(…)`, `CodeService.symmetricalCodes`, `DuplicateCorpusCodeError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:45` |
| `IsForkCharacteristicService.compute` | 7 | `BettiNumber0CountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `ForkCountCharacteristicService.compute`, `CrossCountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `DotCountCharacteristicService.compute`, `IsCombCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-fork-characteristic.service.ts:64` |
| `IsPureTreeCharacteristicService.compute` | 7 | `BettiNumber0CountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `ForkCountCharacteristicService.compute`, `CrossCountCharacteristicService.compute`, `DotCountCharacteristicService.compute`, `IsCombCharacteristicService.compute`, `IsArcadeCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-pure-tree-characteristic.service.ts:64` |

<details>
<summary>362 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TileEnumerationService.enumerate` | 7 | `TileEnumerationService.isAdmitted`, `OversizedTileError.constructor`, `TileEnumerationService.edges`, `TileEnumerationService.map(…)`, `TileEnumerationService.toSorted(…)`, `TileEnumerationService.map(…)`, `TileEnumerationService.orbitMinima` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:127` |
| `DrawRecordService.record` | 7 | `CodeService.parse`, `CodeService.canonicalRotation`, `CharacteristicsService.compute`, `CharacteristicsService.isReducible`, `CharacteristicsService.stored`, `CodeService.format`, `CodeService.symmetricalCodes` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/enumeration/draw-record.service.ts:35` |
| `IsArcadeCharacteristicService.compute` | 6 | `ForkCountCharacteristicService.compute`, `CrossCountCharacteristicService.compute`, `DotCountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `LongestVerticalRunLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-arcade-characteristic.service.ts:61` |
| `IsMeshCharacteristicService.compute` | 6 | `CrossCountCharacteristicService.compute`, `CornerCountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `DotCountCharacteristicService.compute`, `TileCrossingCountCharacteristicService.compute`, `LongestVerticalRunLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-mesh-characteristic.service.ts:60` |
| `IsDoubleChainCharacteristicService.compute` | 6 | `CompoundUtilitiesService.isJunctionFree`, `StrandUtilitiesService.hasStrandEnds`, `BettiNumber1CountCharacteristicService.compute`, `StrandUtilitiesService.isWrappingReversal`, `LongestHorizontalRunLengthCharacteristicService.compute`, `LongestVerticalRunLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-double-chain-characteristic.service.ts:57` |
| `IsWhirlCharacteristicService.compute` | 6 | `BettiNumber0CountCharacteristicService.compute`, `IsWhirlCharacteristicService.isOpenStrandSet`, `MaxMonotonicTurnLengthCharacteristicService.compute`, `TotalTurnCountCharacteristicService.compute`, `InflectionCountCharacteristicService.compute`, `LongestHorizontalRunLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-whirl-characteristic.service.ts:81` |
| `TileEnumerationService.orbitMinima` | 6 | `TileEnumerationService.edges`, `TileEnumerationService.isAdmitted`, `OversizedTileError.constructor`, `TileEnumerationService.map(…)`, `SymmetryService.edgePermutations`, `TileEnumerationService.every(…)` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:186` |
| `DrawIndexService.pages` | 6 | `DrawIndexService.group(…)`, `DrawIndexService.group`, `DrawIndexService.flatMap(…)`, `DrawIndexService.indexPage`, `DrawIndexService.map(…)`, `DrawIndexService.patternPage` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:162` |
| `DrawIndexService.renderBand` | 6 | `GeometryService.compute`, `DrawIndexService.format`, `DrawIndexService.escape`, `CodeService.parse`, `DrawingService.render`, `DrawIndexService.renderRepeats` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:209` |
| `IsCombCharacteristicService.compute` | 5 | `BettiNumber0CountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `CrossCountCharacteristicService.compute`, `ForkCountCharacteristicService.compute`, `TotalTurnCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-comb-characteristic.service.ts:57` |
| `IsClaspsCharacteristicService.compute` | 5 | `CompoundUtilitiesService.isJunctionFree`, `ReversesAtItsTightestTurnCharacteristicService.compute`, `EndsAreLatticeNeighborsCharacteristicService.compute`, `LongestHorizontalRunLengthCharacteristicService.compute`, `MaxMonotonicTurnLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-clasps-characteristic.service.ts:58` |
| `IsSwirlCharacteristicService.compute` | 5 | `MaxMonotonicTurnLengthCharacteristicService.compute`, `CompoundUtilitiesService.isJunctionFree`, `BettiNumber1CountCharacteristicService.compute`, `TightestTurnCountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-swirl-characteristic.service.ts:57` |
| `IsWhirlCharacteristicService.isOpenStrandSet` | 5 | `CompoundUtilitiesService.isJunctionFree`, `DotCountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `BettiNumber0CountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-whirl-characteristic.service.ts:68` |
| `LetterUtilitiesService.orientation` | 5 | `LetterUtilitiesService.parse`, `LetterUtilitiesService.flips`, `LetterUtilitiesService.reduce(…)`, `LetterUtilitiesService.turnClockwise`, `SubmatrixUtilitiesService.glyphWindow` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:190` |
| `RectangleUtilitiesService.ringCloses` | 5 | `RectangleUtilitiesService.from(…)`, `RectangleUtilitiesService.from(…)`, `SubmatrixUtilitiesService.pointDigitAt`, `RectangleUtilitiesService.every(…)`, `RectangleUtilitiesService.every(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:69` |
| `DrawingService.render` | 5 | `GeometryService.compute`, `DrawingService.codeSegments`, `GeometryService.borderPath`, `SvgService.render`, `DrawingService.format` | `projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:108` |
| `DrawEnumerationService.persist` | 5 | `DatabaseService.codes`, `DrawPoolService.batches`, `DatabaseService.saveAll`, `DrawEnumerationService.filter(…)`, `DrawPoolService.close` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/enumeration/draw-enumeration.service.ts:46` |
| `DrawIndexService.shapeSections` | 5 | `DrawIndexService.reduce(…)`, `DrawIndexService.map(…)`, `DrawIndexService.sectionHead`, `DrawIndexService.renderFigure`, `DrawIndexService.shapeHead` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:265` |
| `DrawCommand.drawAll` | 5 | `DatabaseService.clear`, `CorpusService.ingest`, `DrawCommand.map(…)`, `DrawEnumerationService.drawAll`, `DrawCommand.writePages` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:66` |
| `SymmetryService.transform` | 4 | `TileService.edges`, `TileService.blankEdges`, `SymmetryService.place`, `TileService.build` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:144` |
| `CodeService.symmetricalCodes` | 4 | `CodeService.format`, `CodeService.map(…)`, `SymmetryService.reflections`, `CodeService.tile` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:280` |
| `ConnectivityService.connectivity` | 4 | `ConnectivityService.edges`, `ConnectivityService.adjacency`, `GraphService.components`, `ConnectivityService.freeEnds` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:99` |
| `CharacteristicsService.discover` | 4 | `CharacteristicsService.flatMap(…)`, `CharacteristicsService.verify`, `CharacteristicRegistryError.constructor`, `CharacteristicsService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:93` |
| `CharacteristicsService.verify` | 4 | `CharacteristicsService.isCharacteristicEvaluator`, `CharacteristicsService.isCharacteristicKey`, `CharacteristicRegistryError.constructor`, `CharacteristicsService.valueTypeOf` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:185` |
| `CharacteristicsService.compute` | 4 | `CharacteristicContextService.create`, `CharacteristicsService.map(…)`, `CharacteristicsService.evaluators`, `CharacteristicsService.assertCharacteristics` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:203` |
| `CharacteristicsService.stored` | 4 | `CharacteristicsService.map(…)`, `CharacteristicsService.filter(…)`, `CharacteristicsService.map(…)`, `CharacteristicsService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:237` |
| `SubmatrixUtilitiesService.countIsolatedGlyphs` | 4 | `SubmatrixUtilitiesService.glyphCells`, `SubmatrixUtilitiesService.map(…)`, `SubmatrixUtilitiesService.digitGrid`, `SubmatrixUtilitiesService.matchesAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:89` |
| `ReversesAtItsTightestTurnCharacteristicService.traceSinglePath` | 4 | `ReversesAtItsTightestTurnCharacteristicService.findStartNode`, `ReversesAtItsTightestTurnCharacteristicService.findNextNode`, `ReversesAtItsTightestTurnCharacteristicService.advancePath`, `ReversesAtItsTightestTurnCharacteristicService.checkFinalLoopTurn` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:257` |
| `ReversesAtItsTightestTurnCharacteristicService.compute` | 4 | `ReversesAtItsTightestTurnCharacteristicService.isJunctionFree`, `ConnectivityService.edges`, `ReversesAtItsTightestTurnCharacteristicService.buildAdjacencyGraph`, `ReversesAtItsTightestTurnCharacteristicService.tracePaths` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:309` |
| `CornerCountCharacteristicService.compute` | 4 | `NorthEastCornerCountCharacteristicService.compute`, `NorthWestCornerCountCharacteristicService.compute`, `SouthEastCornerCountCharacteristicService.compute`, `SouthWestCornerCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/corner/corner-count-characteristic.service.ts:56` |
| `ForkCountCharacteristicService.compute` | 4 | `NorthForkCountCharacteristicService.compute`, `SouthForkCountCharacteristicService.compute`, `EastForkCountCharacteristicService.compute`, `WestForkCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/fork/fork-count-characteristic.service.ts:55` |
| `IsClosedLoopCharacteristicService.compute` | 4 | `BettiNumber0CountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `CompoundUtilitiesService.isJunctionFree` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/structure/is-closed-loop-characteristic.service.ts:53` |
| `IsSingleArcCharacteristicService.compute` | 4 | `BettiNumber0CountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `CompoundUtilitiesService.isJunctionFree` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/structure/is-single-arc-characteristic.service.ts:53` |
| `IsCrossCharacteristicService.compute` | 4 | `CrossCountCharacteristicService.compute`, `ForkCountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute`, `DotCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/junctions/is-cross-characteristic.service.ts:54` |
| `IsBarsCharacteristicService.compute` | 4 | `EdgeCountCharacteristicService.compute`, `EastEdgeCountCharacteristicService.compute`, `DotCountCharacteristicService.compute`, `LongestVerticalRunLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-bars-characteristic.service.ts:53` |
| `IsParallelCharacteristicService.compute` | 4 | `CompoundUtilitiesService.isJunctionFree`, `DotCountCharacteristicService.compute`, `EdgeCountCharacteristicService.compute`, `MaxMonotonicTurnLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-parallel-characteristic.service.ts:55` |
| `IsBoxesCharacteristicService.compute` | 4 | `MaxMonotonicTurnLengthCharacteristicService.compute`, `InflectionCountCharacteristicService.compute`, `TightestTurnCountCharacteristicService.compute`, `BettiNumber0CountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-boxes-characteristic.service.ts:54` |
| `StrandUtilitiesService.isWrappingReversal` | 4 | `TileCrossingCountCharacteristicService.compute`, `ReversesAtItsTightestTurnCharacteristicService.compute`, `EndsOnBorderRulesCharacteristicService.compute`, `StrandUtilitiesService.isFullInkWithoutDots` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/strand-utilities.service.ts:67` |
| `DatabaseService.saveAll` | 4 | `DatabaseService.filter(…)`, `DatabaseService.map(…)`, `DatabaseService.map(…)`, `DatabaseService.transaction(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:174` |
| `TileEnumerationService.tile` | 4 | `TileService.blankEdges`, `TileEnumerationService.edges`, `TileEnumerationService.set`, `TileService.build` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:214` |
| `DrawWorkerService.map(…)` | 4 | `DrawRecordService.record`, `CodeService.spell`, `SymmetryService.canonicalTile`, `TileEnumerationService.tile` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-worker.service.ts:45` |
| `DrawPoolService.batches` | 4 | `DrawPoolService.batchesOf`, `TileEnumerationService.orbitMinima`, `DrawWorkerService.records`, `DrawPoolService.waves` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:163` |
| `CodeService.parse` | 3 | `CodeService.parseFormatted`, `CodeService.parseBare`, `InvalidCodeFormatError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:176` |
| `CodeService.map(…)` | 3 | `CodeService.format`, `CodeService.canonicalRotation`, `CodeService.spellDigits` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:288` |
| `CharacteristicContextService.create` | 3 | `CharacteristicContextService.build`, `CodeService.reduceToUnit`, `CharacteristicContextService.parse` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:61` |
| `ConnectivityService.edges` | 3 | `ConnectivityService.key`, `ConnectivityService.joinsEast`, `ConnectivityService.joinsSouth` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:114` |
| `CharacteristicsService.assertCharacteristics` | 3 | `CharacteristicsService.find(…)`, `CharacteristicRegistryError.constructor`, `CharacteristicsService.valueTypeOf` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:65` |
| `CharacteristicsService.candidates` | 3 | `CharacteristicsService.isCandidateEvaluator`, `CharacteristicsService.isCandidateGroup`, `CharacteristicsService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:83` |
| `EndsOnBorderRulesCharacteristicService.compute` | 3 | `EndUtilitiesService.freeEndPoints`, `ConnectivityService.edges`, `EndsOnBorderRulesCharacteristicService.every(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/end/ends-on-border-rules-characteristic.service.ts:50` |
| `SubmatrixUtilitiesService.flatMap(…)` | 3 | `SubmatrixUtilitiesService.map(…)`, `SubmatrixUtilitiesService.filter(…)`, `SubmatrixUtilitiesService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:49` |
| `PathUtilitiesService.halfEdgeGraph` | 3 | `PathUtilitiesService.position`, `PathUtilitiesService.attach`, `PathUtilitiesService.opposite` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:56` |
| `PathUtilitiesService.strands` | 3 | `PathUtilitiesService.halfEdgeGraph`, `PathUtilitiesService.flatMap(…)`, `PathUtilitiesService.walk` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:195` |
| `InflectionCountCharacteristicService.compute` | 3 | `InflectionCountCharacteristicService.reduce(…)`, `PathUtilitiesService.strands`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/inflection-count-characteristic.service.ts:49` |
| `InflectionCountCharacteristicService.reduce(…)` | 3 | `InflectionCountCharacteristicService.filter(…)`, `PathUtilitiesService.neighborPairs`, `PathUtilitiesService.signedTurns` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/inflection-count-characteristic.service.ts:53` |
| `MaxMonotonicTurnLengthCharacteristicService.compute` | 3 | `MaxMonotonicTurnLengthCharacteristicService.map(…)`, `PathUtilitiesService.strands`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/max-monotonic-turn-length-characteristic.service.ts:48` |
| `ReversesAtItsTightestTurnCharacteristicService.advancePath` | 3 | `ReversesAtItsTightestTurnCharacteristicService.getDirection`, `ReversesAtItsTightestTurnCharacteristicService.applyTurn`, `ReversesAtItsTightestTurnCharacteristicService.findNextNode` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:48` |
| `ReversesAtItsTightestTurnCharacteristicService.findNextNode` | 3 | `ReversesAtItsTightestTurnCharacteristicService.getNeighbors`, `ReversesAtItsTightestTurnCharacteristicService.find(…)`, `ReversesAtItsTightestTurnCharacteristicService.find(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:148` |
| `TightestTurnCountCharacteristicService.compute` | 3 | `TightestTurnCountCharacteristicService.reduce(…)`, `PathUtilitiesService.strands`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/tightest-turn-count-characteristic.service.ts:47` |
| `TotalTurnCountCharacteristicService.compute` | 3 | `TotalTurnCountCharacteristicService.reduce(…)`, `PathUtilitiesService.strands`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/total-turn-count-characteristic.service.ts:48` |
| `IsChainCharacteristicService.compute` | 3 | `MaxMonotonicTurnLengthCharacteristicService.compute`, `TightestTurnCountCharacteristicService.compute`, `TileCrossingComponentDeltaCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/windings/is-chain-characteristic.service.ts:51` |
| `LetterUtilitiesService.evaluator` | 3 | `LetterUtilitiesService.description`, `SubmatrixUtilitiesService.glyphFormula`, `LetterUtilitiesService.displayName` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:128` |
| `RectangleUtilitiesService.isIsolatedRectangleAt` | 3 | `SubmatrixUtilitiesService.pointDigitAt`, `RectangleUtilitiesService.sideLength`, `RectangleUtilitiesService.ringCloses` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:30` |
| `TileEnumerationService.map(…)` | 3 | `SymmetryService.canonicalTile`, `TileEnumerationService.tile`, `SymmetryService.edgeKey` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:141` |
| `DrawPoolService.waves` | 3 | `DrawPoolService.spawn`, `DrawPoolService.wave`, `DrawPoolService.catch(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:134` |
| `TileService.assertPointAgrees` | 2 | `MalformedTileError.constructor`, `TileService.assertPointJoinsBelow` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:36` |
| `TileService.assertWellFormed` | 2 | `MalformedTileError.constructor`, `TileService.assertPointAgrees` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:94` |
| `TileService.from(…)` | 2 | `TileService.horizontal`, `TileService.vertical` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:137` |
| `TileService.edges` | 2 | `TileService.map(…)`, `TileService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:162` |
| `SymmetryService.edgePermutation` | 2 | `SymmetryService.from(…)`, `SymmetryService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:30` |
| `SymmetryService.orbit` | 2 | `SymmetryService.map(…)`, `SymmetryService.elements` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:85` |
| `SymmetryService.place` | 2 | `TileService.mark`, `SymmetryService.mapColumn` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:95` |
| `SymmetryService.signature` | 2 | `SymmetryService.flatMap(…)`, `SymmetryService.edgeKey` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:135` |
| `SymmetryService.canonicalTile` | 2 | `SymmetryService.signature`, `SymmetryService.orbit` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:171` |
| `SymmetryService.edgeKey` | 2 | `TileService.edges`, `SymmetryService.flatMap(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:191` |
| `SymmetryService.edgePermutations` | 2 | `SymmetryService.map(…)`, `SymmetryService.elements` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:203` |
| `SymmetryService.variants` | 2 | `SymmetryService.orbit`, `SymmetryService.edgeKey` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:225` |
| `CodeService.validateDigits` | 2 | `InvalidCodeLengthError.constructor`, `InvalidCodeCharacterError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:100` |
| `CodeService.spell` | 2 | `CodeService.format`, `CodeService.spellDigits` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:240` |
| `CodeService.spellCanonical` | 2 | `CodeService.spell`, `SymmetryService.canonicalTile` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:253` |
| `MatrixService.fromCode` | 2 | `CodeService.parse`, `MatrixService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:65` |
| `MatrixService.toCode` | 2 | `MatrixService.flatMap(…)`, `CodeService.format` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:156` |
| `CharacteristicContextService.build` | 2 | `MatrixService.fromCode`, `CodeService.spellDigits` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:34` |
| `CharacteristicContextService.createUnreduced` | 2 | `CharacteristicContextService.build`, `CharacteristicContextService.parse` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:69` |
| `ConnectivityService.freeEnds` | 2 | `ConnectivityService.bump`, `ConnectivityService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:51` |
| `CharacteristicsService.isCharacteristicEvaluator` | 2 | `CharacteristicsService.isCharacteristicKey`, `CharacteristicsService.valueTypeOf` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:164` |
| `CharacteristicsService.isReducible` | 2 | `CodeService.parse`, `CodeService.reduceToUnit` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:215` |
| `CharacteristicsService.metadata` | 2 | `CharacteristicsService.map(…)`, `CharacteristicsService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:223` |
| `CharacteristicsService.tileCrossingComponentDeltaCount` | 2 | `TileCrossingComponentDeltaCountCharacteristicService.compute`, `CharacteristicContextService.createUnreduced` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:263` |
| `EndUtilitiesService.freeEndPoints` | 2 | `EndUtilitiesService.bump`, `EndUtilitiesService.position` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/end/end-utilities.service.ts:41` |
| `EndsAreLatticeNeighborsCharacteristicService.compute` | 2 | `EndUtilitiesService.freeEndPoints`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/end/ends-are-lattice-neighbors-characteristic.service.ts:49` |
| `PathUtilitiesService.walk` | 2 | `PathUtilitiesService.continuation`, `PathUtilitiesService.turnBetween` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:101` |
| `PathUtilitiesService.longestRun` | 2 | `PathUtilitiesService.findIndex(…)`, `PathUtilitiesService.neighborPairs` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:127` |
| `PathUtilitiesService.rowTouchCount` | 2 | `PathUtilitiesService.position`, `PathUtilitiesService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:168` |
| `MaxMonotonicTurnLengthCharacteristicService.map(…)` | 2 | `PathUtilitiesService.longestRun`, `PathUtilitiesService.signedTurns` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/max-monotonic-turn-length-characteristic.service.ts:53` |
| `BottomBorderTouchCountCharacteristicService.compute` | 2 | `PathUtilitiesService.rowTouchCount`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/border-touch/bottom-border-touch-count-characteristic.service.ts:49` |
| `TopBorderTouchCountCharacteristicService.compute` | 2 | `PathUtilitiesService.rowTouchCount`, `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/border-touch/top-border-touch-count-characteristic.service.ts:49` |
| `TightestTurnCountCharacteristicService.reduce(…)` | 2 | `TightestTurnCountCharacteristicService.filter(…)`, `PathUtilitiesService.neighborPairs` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/tightest-turn-count-characteristic.service.ts:51` |
| `EmbeddedUCountCharacteristicService.compute` | 2 | `EmbeddedUCountCharacteristicService.isEmbeddedU`, `EmbeddedUCountCharacteristicService.windowDigits` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/embedded/embedded-u-count-characteristic.service.ts:88` |
| `CompoundUtilitiesService.isJunctionFree` | 2 | `ForkCountCharacteristicService.compute`, `CrossCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/compound-utilities.service.ts:33` |
| `IsLinesCharacteristicService.compute` | 2 | `NorthEdgeCountCharacteristicService.compute`, `BettiNumber1CountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-lines-characteristic.service.ts:47` |
| `IsSnakeCharacteristicService.compute` | 2 | `IsClosedLoopCharacteristicService.compute`, `DoubleHorizontalEdgeCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-snake-characteristic.service.ts:47` |
| `IsWaterfallsCharacteristicService.compute` | 2 | `IsSingleArcCharacteristicService.compute`, `MaxMonotonicTurnLengthCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-waterfalls-characteristic.service.ts:48` |
| `StrandUtilitiesService.hasStrandEnds` | 2 | `BettiNumber0CountCharacteristicService.compute`, `FreeEndCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/strand-utilities.service.ts:48` |
| `StrandUtilitiesService.isFullInkWithoutDots` | 2 | `DensityCharacteristicService.compute`, `DotCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/strand-utilities.service.ts:59` |
| `LetterUtilitiesService.count` | 2 | `LetterUtilitiesService.track`, `SubmatrixUtilitiesService.countIsolatedGlyphs` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:73` |
| `LetterUtilitiesService.mapArms` | 2 | `LetterUtilitiesService.reduce(…)`, `LetterUtilitiesService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:174` |
| `LetterUtilitiesService.reduce(…)` | 2 | `LetterUtilitiesService.flipHorizontally`, `LetterUtilitiesService.flipVertically` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:198` |
| `LetterUtilitiesService.rectangular` | 2 | `LetterUtilitiesService.map(…)`, `LetterUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:227` |
| `LetterUtilitiesService.turnQuarter` | 2 | `LetterUtilitiesService.rectangular`, `LetterUtilitiesService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:242` |
| `LetterUtilitiesService.evaluators` | 2 | `LetterUtilitiesService.orientations`, `LetterUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:265` |
| `LetterUtilitiesService.flipHorizontally` | 2 | `LetterUtilitiesService.map(…)`, `LetterUtilitiesService.rectangular` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:294` |
| `LetterUtilitiesService.map(…)` | 2 | `LetterUtilitiesService.map(…)`, `LetterUtilitiesService.characters` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:295` |
| `LetterUtilitiesService.flipVertically` | 2 | `LetterUtilitiesService.map(…)`, `LetterUtilitiesService.rectangular` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:307` |
| `LetterUtilitiesService.map(…)` | 2 | `LetterUtilitiesService.map(…)`, `LetterUtilitiesService.characters` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:310` |
| `LetterUtilitiesService.orientations` | 2 | `LetterUtilitiesService.baseCorner`, `LetterUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:338` |
| `LetterUtilitiesService.turnClockwise` | 2 | `LetterUtilitiesService.reduce(…)`, `LetterUtilitiesService.rectangular` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:352` |
| `HorizontalRectangleCountCharacteristicService.compute` | 2 | `HorizontalRectangleCountCharacteristicService.countIsolatedRectangles(…)`, `RectangleUtilitiesService.countIsolatedRectangles` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/horizontal-rectangle-count-characteristic.service.ts:46` |
| `VerticalRectangleCountCharacteristicService.compute` | 2 | `VerticalRectangleCountCharacteristicService.countIsolatedRectangles(…)`, `RectangleUtilitiesService.countIsolatedRectangles` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/vertical-rectangle-count-characteristic.service.ts:46` |
| `DatabaseService.transaction(…)` | 2 | `DatabaseService.flatMap(…)`, `DatabaseService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:187` |
| `TileEnumerationService.set` | 2 | `TileEnumerationService.address`, `TileService.mark` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:107` |
| `EnumerationService.enumerate` | 2 | `EnumerationService.map(…)`, `TileEnumerationService.enumerate` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/enumeration.service.ts:56` |
| `EnumerationService.shapes` | 2 | `EnumerationService.isAdmitted`, `TileEnumerationService.maximumColumns` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/enumeration.service.ts:75` |
| `CorpusService.ingest` | 2 | `CorpusService.filter(…)`, `CorpusService.ingestOne` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:92` |
| `DrawingService.codeSegments` | 2 | `CodeService.directionsAt`, `DrawingService.pointSegments` | `projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:39` |
| `DrawingService.pointSegments` | 2 | `DrawingService.format`, `DrawingService.isBare` | `projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:80` |
| `DrawCodeService.draw` | 2 | `DatabaseService.save`, `DrawRecordService.record` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/enumeration/draw-code.service.ts:35` |
| `DrawPoolService.wave` | 2 | `DrawPoolService.flatMap(…)`, `DrawPoolService.spawn` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:116` |
| `DrawEnumerationService.drawAll` | 2 | `DrawEnumerationService.persist`, `EnumerationService.shapes` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/enumeration/draw-enumeration.service.ts:38` |
| `DrawIndexService.caption` | 2 | `DrawIndexService.filter(…)`, `DrawIndexService.escape` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:55` |
| `DrawIndexService.heldRows` | 2 | `DrawIndexService.toSorted(…)`, `DrawIndexService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:125` |
| `DrawIndexService.indexPage` | 2 | `DrawIndexService.map(…)`, `DrawIndexService.documentHead` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:142` |
| `DrawIndexService.patternPage` | 2 | `DrawIndexService.documentHead`, `DrawIndexService.shapeSections` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:192` |
| `DrawIndexService.renderFigure` | 2 | `DrawIndexService.renderBand`, `DrawIndexService.caption` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:229` |
| `DrawIndexService.build` | 2 | `DatabaseService.patternShapeCounts`, `DrawIndexService.pages` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:310` |
| `DrawIndexService.render` | 2 | `DrawIndexService.pages`, `DrawIndexService.collect` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:325` |
| `DrawCommand.runCodeDrawing` | 2 | `IncompleteCodeDrawingError.constructor`, `DrawCodeService.draw` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:93` |
| `DrawCommand.run` | 2 | `DrawCommand.drawAll`, `DrawCommand.runCodeDrawing` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:163` |
| `TileService.assertPointJoinsBelow` | 1 | `MalformedTileError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:58` |
| `TileService.blankEdges` | 1 | `TileService.grid` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:117` |
| `TileService.grid` | 1 | `TileService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:119` |
| `TileService.from(…)` | 1 | `TileService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:120` |
| `TileService.build` | 1 | `TileService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:131` |
| `TileService.from(…)` | 1 | `TileService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:136` |
| `TileService.map(…)` | 1 | `TileService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:164` |
| `TileService.map(…)` | 1 | `TileService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:167` |
| `TileService.incidentEdges` | 1 | `TileService.degree` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:175` |
| `TileService.isBare` | 1 | `TileService.degree` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/tile/tile.service.ts:188` |
| `SymmetryService.image` | 1 | `SymmetryService.mapColumn` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:37` |
| `SymmetryService.from(…)` | 1 | `SymmetryService.image` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:50` |
| `SymmetryService.from(…)` | 1 | `SymmetryService.image` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:53` |
| `SymmetryService.elements` | 1 | `SymmetryService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:63` |
| `SymmetryService.from(…)` | 1 | `SymmetryService.flatMap(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:64` |
| `SymmetryService.flatMap(…)` | 1 | `SymmetryService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:65` |
| `SymmetryService.map(…)` | 1 | `SymmetryService.transform` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:86` |
| `SymmetryService.flatMap(…)` | 1 | `SymmetryService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:137` |
| `SymmetryService.map(…)` | 1 | `SymmetryService.rank` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:137` |
| `SymmetryService.flatMap(…)` | 1 | `SymmetryService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:195` |
| `SymmetryService.map(…)` | 1 | `SymmetryService.edgePermutation` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:204` |
| `SymmetryService.reflections` | 1 | `SymmetryService.transform` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/symmetry/symmetry.service.ts:213` |
| `CodeService.parseBare` | 1 | `CodeService.validateDigits` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:65` |
| `CodeService.parseFormatted` | 1 | `CodeService.validateDigits` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:77` |
| `CodeService.anonymous` | 1 | `CodeService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:121` |
| `CodeService.from(…)` | 1 | `CodeService.rotate` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:122` |
| `CodeService.directionsAt` | 1 | `CodeService.decode` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:147` |
| `CodeService.reduceToUnit` | 1 | `CodeService.isRepeatingUnit` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:193` |
| `CodeService.rotate` | 1 | `CodeService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:223` |
| `CodeService.spellDigits` | 1 | `CodeService.flatMap(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:261` |
| `CodeService.flatMap(…)` | 1 | `CodeService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:263` |
| `CodeService.tile` | 1 | `CodeService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:307` |
| `CodeService.from(…)` | 1 | `CodeService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:312` |
| `CodeService.from(…)` | 1 | `CodeService.directionsAt` | `projects/meanderaw/meanderaw-cli/src/modules/code/code.service.ts:313` |
| `MatrixService.extractSubmatrix` | 1 | `MatrixService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:33` |
| `MatrixService.from(…)` | 1 | `MatrixService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:42` |
| `MatrixService.from(…)` | 1 | `MatrixService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:73` |
| `MatrixService.from(…)` | 1 | `CodeService.directionsAt` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:74` |
| `MatrixService.rotate` | 1 | `MatrixService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:100` |
| `MatrixService.submatrices` | 1 | `MatrixService.extractSubmatrix` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:118` |
| `MatrixService.flatMap(…)` | 1 | `MatrixService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/matrix/matrix.service.ts:165` |
| `CharacteristicContextService.parse` | 1 | `CodeService.parse` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristic-context.service.ts:51` |
| `GraphService.components` | 1 | `GraphService.walk` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/modules/graph/graph.service.ts:50` |
| `ConnectivityService.adjacency` | 1 | `ConnectivityService.nodes` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:32` |
| `ConnectivityService.nodes` | 1 | `ConnectivityService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:85` |
| `ConnectivityService.from(…)` | 1 | `ConnectivityService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:88` |
| `ConnectivityService.from(…)` | 1 | `ConnectivityService.key` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/connectivity/connectivity.service.ts:89` |
| `TileCrossingComponentDeltaCountCharacteristicService.compute` | 1 | `ConnectivityService.connectivity` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/tile-crossing/tile-crossing-component-delta-count-characteristic.service.ts:45` |
| `CharacteristicsService.find(…)` | 1 | `CharacteristicsService.valueTypeOf` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:69` |
| `CharacteristicsService.filter(…)` | 1 | `CharacteristicsService.isCandidateEvaluator` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:87` |
| `CharacteristicsService.flatMap(…)` | 1 | `CharacteristicsService.candidates` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:98` |
| `CharacteristicsService.map(…)` | 1 | `CharacteristicRegistryError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:110` |
| `CharacteristicsService.evaluators` | 1 | `CharacteristicsService.discover` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:130` |
| `CharacteristicsService.map(…)` | 1 | `CharacteristicsService.entry` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:206` |
| `CharacteristicsService.onApplicationBootstrap` | 1 | `CharacteristicsService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/characteristics.service.ts:230` |
| `TileCrossingCountCharacteristicService.compute` | 1 | `ConnectivityService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/tile-crossing/tile-crossing-count-characteristic.service.ts:45` |
| `TileCrossingCycleCountCharacteristicService.compute` | 1 | `ConnectivityService.connectivity` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/tile-crossing/tile-crossing-cycle-count-characteristic.service.ts:45` |
| `BettiNumber0CountCharacteristicService.compute` | 1 | `ConnectivityService.connectivity` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-0-count-characteristic.service.ts:44` |
| `BettiNumber1CountCharacteristicService.compute` | 1 | `ConnectivityService.connectivity` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/betti-number-1-count-characteristic.service.ts:44` |
| `FreeEndCountCharacteristicService.compute` | 1 | `ConnectivityService.connectivity` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/topology/free-end-count-characteristic.service.ts:44` |
| `SubmatrixUtilitiesService.glyphCells` | 1 | `SubmatrixUtilitiesService.flatMap(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:43` |
| `SubmatrixUtilitiesService.digitGrid` | 1 | `SubmatrixUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:165` |
| `SubmatrixUtilitiesService.map(…)` | 1 | `SubmatrixUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:171` |
| `SubmatrixUtilitiesService.map(…)` | 1 | `SubmatrixUtilitiesService.pointDigitAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:172` |
| `SubmatrixUtilitiesService.glyphFormula` | 1 | `SubmatrixUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:182` |
| `SubmatrixUtilitiesService.map(…)` | 1 | `SubmatrixUtilitiesService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:184` |
| `SubmatrixUtilitiesService.glyphWindow` | 1 | `SubmatrixUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/submatrix-utilities.service.ts:198` |
| `EastEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithArm` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/directional-edge-counts/east-edge-count-characteristic.service.ts:46` |
| `NorthEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithArm` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/directional-edge-counts/north-edge-count-characteristic.service.ts:46` |
| `SouthEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithArm` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/directional-edge-counts/south-edge-count-characteristic.service.ts:46` |
| `WestEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithArm` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/directional-edge-counts/west-edge-count-characteristic.service.ts:46` |
| `DoubleHorizontalEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/edge-counts/double-horizontal-edge-count-characteristic.service.ts:47` |
| `DoubleVerticalEdgeCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/edge-counts/double-vertical-edge-count-characteristic.service.ts:47` |
| `EdgeCountCharacteristicService.compute` | 1 | `PointUtilitiesService.armCount` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/edge-counts/edge-count-characteristic.service.ts:46` |
| `InkPointCountCharacteristicService.compute` | 1 | `PointUtilitiesService.armCount` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/ink-counts/ink-point-count-characteristic.service.ts:45` |
| `DensityCharacteristicService.compute` | 1 | `InkPointCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/ink-counts/density-characteristic.service.ts:46` |
| `DotCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/point/modules/ink-counts/dot-count-characteristic.service.ts:44` |
| `PathUtilitiesService.continuation` | 1 | `PathUtilitiesService.find(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:39` |
| `PathUtilitiesService.find(…)` | 1 | `PathUtilitiesService.opposite` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:47` |
| `PathUtilitiesService.neighborPairs` | 1 | `PathUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:147` |
| `PathUtilitiesService.signedTurns` | 1 | `PathUtilitiesService.filter(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/path-utilities.service.ts:188` |
| `ReversesAtItsTightestTurnCharacteristicService.checkFinalLoopTurn` | 1 | `ReversesAtItsTightestTurnCharacteristicService.applyTurn` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:126` |
| `ReversesAtItsTightestTurnCharacteristicService.findStartNode` | 1 | `ReversesAtItsTightestTurnCharacteristicService.getNeighbors` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:163` |
| `ReversesAtItsTightestTurnCharacteristicService.getDirection` | 1 | `ReversesAtItsTightestTurnCharacteristicService.parseKey` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:189` |
| `ReversesAtItsTightestTurnCharacteristicService.isJunctionFree` | 1 | `PointUtilitiesService.armCount` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:215` |
| `ReversesAtItsTightestTurnCharacteristicService.tracePaths` | 1 | `ReversesAtItsTightestTurnCharacteristicService.traceSinglePath` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/modules/tightest-turn/reverses-at-its-tightest-turn-characteristic.service.ts:234` |
| `TotalTurnCountCharacteristicService.reduce(…)` | 1 | `PathUtilitiesService.signedTurns` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/path/modules/turn/total-turn-count-characteristic.service.ts:52` |
| `NorthEastCornerCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/corner/north-east-corner-count-characteristic.service.ts:46` |
| `NorthWestCornerCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/corner/north-west-corner-count-characteristic.service.ts:46` |
| `SouthEastCornerCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/corner/south-east-corner-count-characteristic.service.ts:46` |
| `SouthWestCornerCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/corner/south-west-corner-count-characteristic.service.ts:46` |
| `CrossCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/cross/cross-count-characteristic.service.ts:45` |
| `EmbeddedUCountCharacteristicService.windowDigits` | 1 | `SubmatrixUtilitiesService.pointDigitAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/embedded/embedded-u-count-characteristic.service.ts:68` |
| `EastForkCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/fork/east-fork-count-characteristic.service.ts:46` |
| `NorthForkCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/fork/north-fork-count-characteristic.service.ts:46` |
| `SouthForkCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/fork/south-fork-count-characteristic.service.ts:46` |
| `WestForkCountCharacteristicService.compute` | 1 | `SubmatrixUtilitiesService.countPointsWithExactArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/fork/west-fork-count-characteristic.service.ts:46` |
| `RunUtilitiesService.longestHorizontalRunLength` | 1 | `RunUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/run/run-utilities.service.ts:65` |
| `RunUtilitiesService.map(…)` | 1 | `RunUtilitiesService.longestRowRunLength` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/run/run-utilities.service.ts:72` |
| `RunUtilitiesService.longestVerticalRunLength` | 1 | `RunUtilitiesService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/run/run-utilities.service.ts:80` |
| `RunUtilitiesService.from(…)` | 1 | `RunUtilitiesService.longestColumnRunLength` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/run/run-utilities.service.ts:87` |
| `LongestHorizontalRunLengthCharacteristicService.compute` | 1 | `RunUtilitiesService.longestHorizontalRunLength` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/run/longest-horizontal-run-length-characteristic.service.ts:46` |
| `LongestVerticalRunLengthCharacteristicService.compute` | 1 | `RunUtilitiesService.longestVerticalRunLength` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/run/longest-vertical-run-length-characteristic.service.ts:46` |
| `IsDotsCharacteristicService.compute` | 1 | `InkPointCountCharacteristicService.compute` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/compound/modules/pattern/modules/plain-strands/is-dots-characteristic.service.ts:43` |
| `LetterUtilitiesService.characters` | 1 | `LetterUtilitiesService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:64` |
| `LetterUtilitiesService.description` | 1 | `LetterUtilitiesService.drawing` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:95` |
| `LetterUtilitiesService.compute` | 1 | `LetterUtilitiesService.count` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:137` |
| `LetterUtilitiesService.parse` | 1 | `LetterUtilitiesService.isTurn` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:216` |
| `LetterUtilitiesService.from(…)` | 1 | `LetterUtilitiesService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:245` |
| `LetterUtilitiesService.map(…)` | 1 | `LetterUtilitiesService.mapArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:247` |
| `LetterUtilitiesService.map(…)` | 1 | `LetterUtilitiesService.evaluator` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:281` |
| `LetterUtilitiesService.map(…)` | 1 | `LetterUtilitiesService.mapArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:298` |
| `LetterUtilitiesService.map(…)` | 1 | `LetterUtilitiesService.mapArms` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:312` |
| `LetterUtilitiesService.formEvaluators` | 1 | `LetterUtilitiesService.flatMap(…)` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:322` |
| `LetterUtilitiesService.flatMap(…)` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:325` |
| `LetterUtilitiesService.map(…)` | 1 | `LetterUtilitiesService.orientation` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:343` |
| `LetterUtilitiesService.reduce(…)` | 1 | `LetterUtilitiesService.turnQuarter` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/letter-utilities.service.ts:358` |
| `AinArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/ain-arabic-letter-characteristics.service.ts:20` |
| `AlefArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/alef-arabic-letter-characteristics.service.ts:20` |
| `BehArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/beh-arabic-letter-characteristics.service.ts:20` |
| `DalArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/dal-arabic-letter-characteristics.service.ts:20` |
| `FehArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/feh-arabic-letter-characteristics.service.ts:20` |
| `HahArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-ain-to-hah/hah-arabic-letter-characteristics.service.ts:20` |
| `HehArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/heh-arabic-letter-characteristics.service.ts:20` |
| `KafArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/kaf-arabic-letter-characteristics.service.ts:20` |
| `LamArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/lam-arabic-letter-characteristics.service.ts:20` |
| `MeemArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/meem-arabic-letter-characteristics.service.ts:20` |
| `NoonArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/noon-arabic-letter-characteristics.service.ts:19` |
| `QafArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-heh-to-qaf/qaf-arabic-letter-characteristics.service.ts:19` |
| `RehArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/reh-arabic-letter-characteristics.service.ts:19` |
| `SadArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/sad-arabic-letter-characteristics.service.ts:20` |
| `SeenArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/seen-arabic-letter-characteristics.service.ts:20` |
| `TahArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/tah-arabic-letter-characteristics.service.ts:20` |
| `WawArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/waw-arabic-letter-characteristics.service.ts:19` |
| `YehArabicLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.formEvaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/arabic-reh-to-yeh/yeh-arabic-letter-characteristics.service.ts:19` |
| `DeltaGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-delta-to-omega/delta-greek-letter-characteristics.service.ts:18` |
| `KappaGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-delta-to-omega/kappa-greek-letter-characteristics.service.ts:26` |
| `LambdaGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-delta-to-omega/lambda-greek-letter-characteristics.service.ts:18` |
| `OmegaGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-delta-to-omega/omega-greek-letter-characteristics.service.ts:19` |
| `PhiGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-phi-to-sigma/phi-greek-letter-characteristics.service.ts:19` |
| `PsiGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-phi-to-sigma/psi-greek-letter-characteristics.service.ts:24` |
| `RhoGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-phi-to-sigma/rho-greek-letter-characteristics.service.ts:19` |
| `SigmaGreekLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/greek-phi-to-sigma/sigma-greek-letter-characteristics.service.ts:25` |
| `KieukHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/kieuk-hangul-letter-characteristics.service.ts:18` |
| `PieupHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/pieup-hangul-letter-characteristics.service.ts:19` |
| `YaHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/ya-hangul-letter-characteristics.service.ts:19` |
| `YeoHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/yeo-hangul-letter-characteristics.service.ts:19` |
| `YoHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/yo-hangul-letter-characteristics.service.ts:19` |
| `YuHangulLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hangul/yu-hangul-letter-characteristics.service.ts:23` |
| `AoHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/ao-hanzi-letter-characteristics.service.ts:18` |
| `GanHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/gan-hanzi-letter-characteristics.service.ts:18` |
| `JiaHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/jia-hanzi-letter-characteristics.service.ts:18` |
| `JingHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/jing-hanzi-letter-characteristics.service.ts:18` |
| `MuHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/mu-hanzi-letter-characteristics.service.ts:19` |
| `ShangHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-ao-to-shang/shang-hanzi-letter-characteristics.service.ts:19` |
| `ShenHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/shen-hanzi-letter-characteristics.service.ts:19` |
| `TianHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/tian-hanzi-letter-characteristics.service.ts:26` |
| `TuHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/tu-hanzi-letter-characteristics.service.ts:19` |
| `TuSoilHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/tu-soil-hanzi-letter-characteristics.service.ts:19` |
| `WangHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/wang-hanzi-letter-characteristics.service.ts:26` |
| `YouHanziLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hanzi-shen-to-you/you-hanzi-letter-characteristics.service.ts:25` |
| `DaletHebrewLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hebrew-katakana/dalet-hebrew-letter-characteristics.service.ts:18` |
| `LamedHebrewLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hebrew-katakana/lamed-hebrew-letter-characteristics.service.ts:18` |
| `TavHebrewLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hebrew-katakana/tav-hebrew-letter-characteristics.service.ts:19` |
| `YuKatakanaLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/hebrew-katakana/yu-katakana-letter-characteristics.service.ts:23` |
| `ALatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/a-latin-letter-characteristics.service.ts:26` |
| `BLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/b-latin-letter-characteristics.service.ts:26` |
| `CLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/c-latin-letter-characteristics.service.ts:25` |
| `ELatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/e-latin-letter-characteristics.service.ts:26` |
| `FLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/f-latin-letter-characteristics.service.ts:26` |
| `HLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-a-to-h/h-latin-letter-characteristics.service.ts:26` |
| `ILatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/i-latin-letter-characteristics.service.ts:25` |
| `LLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/l-latin-letter-characteristics.service.ts:25` |
| `MLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/m-latin-letter-characteristics.service.ts:19` |
| `NLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/n-latin-letter-characteristics.service.ts:26` |
| `OLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/o-latin-letter-characteristics.service.ts:24` |
| `SLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-i-to-s/s-latin-letter-characteristics.service.ts:26` |
| `TLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/t-latin-letter-characteristics.service.ts:25` |
| `ULatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/u-latin-letter-characteristics.service.ts:25` |
| `WLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/w-latin-letter-characteristics.service.ts:19` |
| `XLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/x-latin-letter-characteristics.service.ts:25` |
| `YLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/y-latin-letter-characteristics.service.ts:26` |
| `ZLatinLetterCharacteristicsService.constructor` | 1 | `LetterUtilitiesService.evaluators` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/letter/modules/latin-t-to-z/z-latin-letter-characteristics.service.ts:26` |
| `RectangleUtilitiesService.from(…)` | 1 | `SubmatrixUtilitiesService.pointDigitAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:76` |
| `RectangleUtilitiesService.from(…)` | 1 | `SubmatrixUtilitiesService.pointDigitAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:83` |
| `RectangleUtilitiesService.sideLength` | 1 | `SubmatrixUtilitiesService.pointDigitAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:105` |
| `RectangleUtilitiesService.countIsolatedRectangles` | 1 | `RectangleUtilitiesService.isIsolatedRectangleAt` | `projects/meanderaw/meanderaw-cli/src/modules/characteristics/modules/submatrix/modules/rectangle/rectangle-utilities.service.ts:137` |
| `DatabaseService.codes` | 1 | `DatabaseService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:73` |
| `DatabaseService.patternShapeCounts` | 1 | `DatabaseService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:134` |
| `DatabaseService.flatMap(…)` | 1 | `DatabaseService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:194` |
| `DatabaseService.map(…)` | 1 | `DatabaseService.persistentValue` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:195` |
| `DatabaseService.map(…)` | 1 | `DatabaseService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/database/database.service.ts:198` |
| `TileEnumerationService.byteTables` | 1 | `TileEnumerationService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:75` |
| `TileEnumerationService.from(…)` | 1 | `TileEnumerationService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:78` |
| `TileEnumerationService.isAdmitted` | 1 | `TileEnumerationService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:155` |
| `TileEnumerationService.isMatching` | 1 | `TileService.incidentEdges` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:163` |
| `TileEnumerationService.map(…)` | 1 | `TileEnumerationService.byteTables` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:197` |
| `TileEnumerationService.every(…)` | 1 | `TileEnumerationService.image` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/tile-enumeration.service.ts:201` |
| `EnumerationService.map(…)` | 1 | `CodeService.spell` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/enumeration.service.ts:59` |
| `EnumerationService.isAdmitted` | 1 | `TileEnumerationService.isAdmitted` | `projects/meanderaw/meanderaw-cli/src/modules/enumeration/enumeration.service.ts:67` |
| `CorpusService.canonicalRotation(…)` | 1 | `CharacteristicsService.tileCrossingComponentDeltaCount` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:48` |
| `CorpusService.symmetricalCodes(…)` | 1 | `CharacteristicsService.tileCrossingComponentDeltaCount` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:75` |
| `CorpusService.filter(…)` | 1 | `CorpusService.isPreserved` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:93` |
| `CorpusService.isPreserved` | 1 | `TileEnumerationService.edges` | `projects/meanderaw/meanderaw-cli/src/modules/corpus/corpus.service.ts:107` |
| `GeometryService.borderPath` | 1 | `GeometryService.formatCoordinate` | `projects/meanderaw/meanderaw-cli/src/modules/geometry/geometry.service.ts:30` |
| `SvgService.render` | 1 | `SvgService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/drawing/modules/svg/svg.service.ts:27` |
| `DrawingService.format` | 1 | `GeometryService.formatCoordinate` | `projects/meanderaw/meanderaw-cli/src/modules/drawing/drawing.service.ts:70` |
| `DrawRecordService.scoreTileCrossing` | 1 | `CharacteristicsService.tileCrossingComponentDeltaCount` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/enumeration/draw-record.service.ts:47` |
| `DrawWorkerService.records` | 1 | `DrawWorkerService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-worker.service.ts:44` |
| `DrawPoolService.draw` | 1 | `DrawPoolService.anonymous` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:65` |
| `DrawPoolService.onMessage` | 1 | `DrawWorkerError.constructor` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:74` |
| `DrawPoolService.spawn` | 1 | `DrawPoolService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:94` |
| `DrawPoolService.flatMap(…)` | 1 | `DrawPoolService.draw` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:122` |
| `DrawPoolService.close` | 1 | `DrawPoolService.map(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:182` |
| `DrawPoolService.onModuleDestroy` | 1 | `DrawPoolService.close` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/pool/draw-pool.service.ts:190` |
| `DrawIndexService.format` | 1 | `GeometryService.formatCoordinate` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:103` |
| `DrawIndexService.map(…)` | 1 | `DrawIndexService.reduce(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:172` |
| `DrawIndexService.renderRepeats` | 1 | `DrawIndexService.from(…)` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:234` |
| `DrawIndexService.from(…)` | 1 | `DrawIndexService.format` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:237` |
| `DrawIndexService.shapeHead` | 1 | `DrawIndexService.sectionHead` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:251` |
| `DrawIndexService.rows` | 1 | `DatabaseService.patternRows` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:317` |
| `DrawIndexService.rows` | 1 | `DrawIndexService.heldRows` | `projects/meanderaw/meanderaw-cli/src/modules/draw/modules/index/draw-index.service.ts:345` |
| `DrawCommand.writePages` | 1 | `DrawIndexService.build` | `projects/meanderaw/meanderaw-cli/src/modules/draw/draw.command.ts:116` |
| `bootstrap` | 1 | `on(…)` | `projects/meanderaw/meanderaw-cli/src/worker.ts:18` |
| `on(…)` | 1 | `DrawWorkerService.records` | `projects/meanderaw/meanderaw-cli/src/worker.ts:30` |

</details>
<!-- callidescope:end -->
