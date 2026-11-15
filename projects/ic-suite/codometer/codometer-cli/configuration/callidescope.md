<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codometer/codometer-cli`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 41 |
| Files | 25 |
| Calls traced | 47 |
| Call stacks | 11 |
| Deepest stack | 15 |
| Stacks through recursion | 0 |
| Unfollowable calls | 3 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 15 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

**1. `MeasureCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 MeasureCommand.run(_passedParameters: string[], options: MeasureCommandOptions): Promise<void> [projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:402]
   ↳ Measure the repository and produce every resolved output.
  └─> MeasureService.measure(args: MeasureArguments): MeasurementResult [projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:312]
     ↳ Measure every input the configuration declares.
    └─> MeasureService.measureInput(args: MeasureInputArguments): InputMeasurement [projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:253]
       ↳ Measure one declared input with whichever analyses it asked for.
      └─> MeasureService.analyzeFiles(args: AnalyzeFilesArguments): CodeStatisticsResult [projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:75]
         ↳ Run every analyzer over one set of files and shape the result.
        └─> LanguagesService.analyze(args: AnalyzeLanguagesArguments): LanguageResults [projects/ic-suite/codometer/codometer-languages/src/modules/languages/languages.service.ts:56]
           ↳ Analyze every language present in the discovered files.
          └─> LanguageCommentsService.measure(args: MeasureLanguageCommentsArguments): Record<string, CommentMeasurement[]> [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:212]
             ↳ Measures every counter that names no declaration kind, keyed by the custom statistic's label.
            └─> LanguageCommentsService.flatMap(…)(…): CodometerCommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:234]
              └─> LanguageCommentsService.measureOneLanguage(…): CodometerCommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:96]
                 ↳ Measures one counter's budget against one language's discovered files.
                └─> LanguageCommentsService.measurePython(…): CodometerCommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:162]
                   ↳ Measures Python's comments, which its own analyzer already found.
                  └─> LanguageCommentsService.flatMap(…)(…): CodometerCommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:175]
                    └─> CommentsService.measure(args: MeasureCommentsArguments): CommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:164]
                       ↳ Measures every block a file's comment tokens form, breached or not.
                      └─> CommentsService.flatMap(…)(this: undefined, block: CommentBlock): CodometerCommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:165]
                        └─> CommentsService.measureText(args: MeasureCommentTextArguments): CommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:187]
                           ↳ Measures one comment's text against every maximum declared for it.
                          └─> CommentsService.declaredLimits(…): { limit: number; measured: number; unit: CodometerDocumentationUnit; }[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:64]
                             ↳ Every declared maximum, paired with what this comment measured.
                            └─> CommentsService.countWords(prose: string): number [projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:50]
                               ↳ Counts the words in a comment's prose, markers already stripped.
```

**2. `ConfigurationCommand.run`** — depth ≥ 12 · decorated-method

```text
🚀 ConfigurationCommand.run(…): Promise<void> [projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:107]
   ↳ Lists what the tree beneath the given directory configures.
  └─> ConfigurationListingService.describeConfigurations(args: DescribeConfigurationsArguments): Promise<ConfiguredTree> [projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:146]
     ↳ Resolves the configuration each file in a tree answers with.
    └─> ConfigurationListingService.findConfigurationFiles(args: DescribeConfigurationsArguments): Promise<DiscoveredConfigurationFiles> [projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:179]
       ↳ Finds every configuration file beneath a directory.
      └─> ConfigurationListingService.resolveWalkExclusions(args: DescribeConfigurationsArguments): Promise<WalkExclusions> [projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:115]
         ↳ Resolves the exclusions the walk uses, reporting rather than throwing.
        └─> ConfigurationService.loadConfigurationFile(args: LoadConfigurationArguments): Promise<LoadedConfiguration> [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:78]
           ↳ Loads a configuration and says which file answered.
          └─> ConfigurationService.resolveConfiguration(configuration: CodometerConfiguration): ResolvedCodometerConfiguration [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:123]
             ↳ Fills in every field a configuration file may leave out.
            └─> ConfigurationResolverService.resolveConfiguration(configuration: CodometerConfiguration): ResolvedCodometerConfiguration [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:336]
               ↳ Fills in every field a configuration file may leave out.
              └─> ConfigurationResolverService.resolveLimits(limits: CodometerLimit[] | undefined): ResolvedCodometerLimit[] [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:258]
                 ↳ Gives every limit its severity and a value read as a number.
                └─> ConfigurationResolverService.map(…)(…): { label: string | undefined; metric: string; severity: CodometerSeverity; value: number; } [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:261]
                  └─> ConfigurationResolverService.parseLimitValue(limit: CodometerLimit): number [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:94]
                     ↳ Reads a limit's value, in decimal units when it was written as a string.
                    └─> ConfigurationResolverService.parseLimitValueText(metric: string, text: string): number [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:114]
                       ↳ Reads a limit written as a string, unit and all.
                      └─> InvalidLimitValueError.constructor(metric: string, value: string): InvalidLimitValueError [projects/ic-suite/codometer/codometer-core/src/modules/codometer-core/codometer-core.constants.ts:35]
```

**3. `ChangesCommand.run`** — depth ≥ 11 · decorated-method

```text
🚀 ChangesCommand.run(_passedParameters: string[], options: ChangesCommandOptions): Promise<void> [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:97]
   ↳ Diffs every project's report against the baseline, and emits the result.
  └─> ChangesService.collect(args: CollectRowsArguments): MetricCollection [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:292]
     ↳ Joins every current report to the baseline snapshot.
    └─> ChangesService.map(…)(reportPath: string): MetricCollection [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:293]
      └─> ChangesService.collectProjectRows(args: CollectProjectRowsArguments): MetricCollection [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:110]
         ↳ Joins one project's current report to its baseline.
        └─> ChangesService.readBaseline(args: CollectProjectRowsArguments): Map<string, ReportMetric> [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:154]
           ↳ Reads a baseline report into a name-to-metric lookup.
          └─> ChangesService.readReport(workingDirectory: string, reportPath: string): ProjectReport [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:243]
             ↳ Parses a codometer report, tolerating an absent or malformed file.
            └─> ChangesService.flatMap(…)(…): ReportMetric[] [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:259]
              └─> ChangesService.readMetrics(target: ReportTarget): ReportMetric[] [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:222]
                 ↳ Pulls every metric a target produced out of the report.
                └─> ChangesService.map(…)(…): { breach: MetricSeverity | undefined; empty: boolean; label: string; limit: number | undefined; name: string; unit: "bytes" | null; value: number; } [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:223]
                  └─> ChangesService.readBreach(limits: readonly ReportLimit[]): MetricSeverity | undefined [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:175]
                     ↳ The severity of the worst limit a metric breached, if it breached one.
                    └─> ChangesService.filter(…)(…): boolean [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:178]
```

<details>
<summary>8 more call stacks</summary>

**4. `ChangesCommand.parseDirectory`** — depth 5 · decorated-method

```text
🚀 ChangesCommand.parseDirectory(value: unknown): string [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:70]
   ↳ Parse the directory to look for codometer reports in.
  └─> ConfigurationService.parseDirectoryOption(value: unknown): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a directory option, falling back to the working directory.
    └─> ConfigurationFlagsService.parseDirectoryOption(value: unknown): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:127]
       ↳ Reads a directory option, falling back to the working directory.
      └─> ConfigurationFlagsService.parseDefaultedOption(value: unknown, fallback: string): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:116]
         ↳ Reads an option that carries a default when it was left off.
        └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:143]
           ↳ Reads an option that carries text, or nothing at all.
```

**5. `ConfigurationCommand.parseDirectory`** — depth 5 · decorated-method

```text
🚀 ConfigurationCommand.parseDirectory(value: unknown): string [projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:71]
   ↳ Parse the directory to look for configuration files beneath.
  └─> ConfigurationService.parseDirectoryOption(value: unknown): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a directory option, falling back to the working directory.
    └─> ConfigurationFlagsService.parseDirectoryOption(value: unknown): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:127]
       ↳ Reads a directory option, falling back to the working directory.
      └─> ConfigurationFlagsService.parseDefaultedOption(value: unknown, fallback: string): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:116]
         ↳ Reads an option that carries a default when it was left off.
        └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:143]
           ↳ Reads an option that carries text, or nothing at all.
```

**6. `ConfigurationCommand.parseFormat`** — depth 4 · decorated-method

```text
🚀 ConfigurationCommand.parseFormat(value: unknown): string [projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:80]
   ↳ Parse the output format the listing is rendered in.
  └─> ConfigurationService.parseDefaultedOption(value: unknown, fallback: string): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Reads an option that carries a default when it was left off.
    └─> ConfigurationFlagsService.parseDefaultedOption(value: unknown, fallback: string): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:116]
       ↳ Reads an option that carries a default when it was left off.
      └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:143]
         ↳ Reads an option that carries text, or nothing at all.
```

**7. `ChangesCommand.parseBaseline`** — depth 3 · decorated-method

```text
🚀 ChangesCommand.parseBaseline(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:52]
   ↳ Parse the baseline directory holding a snapshot of the reports.
  └─> ConfigurationService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:107]
     ↳ Reads an option that carries text, or nothing at all.
    └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:143]
       ↳ Reads an option that carries text, or nothing at all.
```

**8. `ChangesCommand.parseBaselineUrl`** — depth 3 · decorated-method

```text
🚀 ChangesCommand.parseBaselineUrl(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:61]
   ↳ Parse the run URL the baseline came from, linked from the summary.
  └─> ConfigurationService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:107]
     ↳ Reads an option that carries text, or nothing at all.
    └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:143]
       ↳ Reads an option that carries text, or nothing at all.
```

**9. `ChangesCommand.parseMarkdown`** — depth 3 · decorated-method

```text
🚀 ChangesCommand.parseMarkdown(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:79]
   ↳ Parse the markdown document the report is spliced into.
  └─> ConfigurationService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:107]
     ↳ Reads an option that carries text, or nothing at all.
    └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:143]
       ↳ Reads an option that carries text, or nothing at all.
```

**10. `ChangesCommand.parseOutput`** — depth 3 · decorated-method

```text
🚀 ChangesCommand.parseOutput(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:88]
   ↳ Parse the file the report is written to on its own.
  └─> ConfigurationService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:107]
     ↳ Reads an option that carries text, or nothing at all.
    └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:143]
       ↳ Reads an option that carries text, or nothing at all.
```

**11. `main`** — depth 2 · module-bootstrap

```text
🚀 main(): Promise<void> [projects/ic-suite/codometer/codometer-cli/src/codometer-cli.main.ts:26]
   ↳ Bootstraps the codometer CLI command application.
  └─> withDefaultCommand(argv: readonly string[]): string[] [projects/ic-suite/codometer/codometer-cli/src/codometer-cli.utilities.ts:14]
     ↳ Inserts the default `measure` subcommand when the command line names no registered command.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MeasureCommand.run` | 9 | `MeasureCommand.resolveWorkingDirectory`, `MeasureCommand.resolveRunPlan`, `DestinationsService.listOutputPaths`, `MeasureCommand.announceOutputPaths`, `MeasureService.measure`, `ReportService.build`, `DeliveryService.deliver`, `DestinationsService.selectScope`, `MeasureCommand.reportFindings` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:402` |
| `MeasureCommand.resolveRunPlan` | 7 | `ConfigurationService.selectMode`, `MeasureCommand.rejectCommandLine`, `MeasureCommand.readConfiguration`, `MeasureCommand.applyInputsOverride`, `ConfigurationService.resolveFormat`, `DestinationsService.resolveDestinations`, `DestinationsService.resolveConsoleMarkdown` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:229` |
| `ChangesCommand.run` | 5 | `ConfigurationService.parseOptionalOption`, `ConfigurationService.parseDirectoryOption`, `ChangesService.collect`, `RenderService.renderSection`, `DocumentsService.emit` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:97` |

<details>
<summary>12 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationCommand.run` | 5 | `ConfigurationService.requireConfigurationPath`, `ConfigurationListingService.describeConfigurations`, `ConfigurationCommand.filter(…)`, `RenderConfigurationService.render`, `ConfigurationListingService.toLimitRows` | `projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:107` |
| `MeasureCommand.reportFindings` | 4 | `MeasureCommand.reportFailures`, `MeasureCommand.reportStaleness`, `MeasureCommand.reportBreaches`, `MeasureCommand.filter(…)` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:192` |
| `MeasureCommand.reportBreaches` | 3 | `MeasureCommand.filter(…)`, `MeasureCommand.filter(…)`, `MeasureCommand.filter(…)` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:145` |
| `MeasureCommand.readConfiguration` | 2 | `ConfigurationService.requireConfigurationPath`, `ConfigurationService.loadConfiguration` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:110` |
| `ChangesCommand.parseBaseline` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:52` |
| `ChangesCommand.parseBaselineUrl` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:61` |
| `ChangesCommand.parseDirectory` | 1 | `ConfigurationService.parseDirectoryOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:70` |
| `ChangesCommand.parseMarkdown` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:79` |
| `ChangesCommand.parseOutput` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:88` |
| `ConfigurationCommand.parseDirectory` | 1 | `ConfigurationService.parseDirectoryOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:71` |
| `ConfigurationCommand.parseFormat` | 1 | `ConfigurationService.parseDefaultedOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:80` |
| `main` | 1 | `withDefaultCommand` | `projects/ic-suite/codometer/codometer-cli/src/codometer-cli.main.ts:26` |

</details>
<!-- callidescope:end -->
