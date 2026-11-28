<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/codometer/codometer-cli`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 43 |
| Files | 25 |
| Calls traced | 50 |
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
🚀 MeasureCommand.run(directories: string[], options: MeasureCommandOptions): Promise<void> [projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:381]
   ↳ Measure the working directory, or each named directory, and fail on any failed run.
  └─> MeasureCommand.measureDirectory(options: MeasureCommandOptions, workingDirectory: string): Promise<boolean> [projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:98]
     ↳ Measure one directory and return whether the run failed.
    └─> MeasureService.measure(args: MeasureArguments): MeasurementResult [projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:275]
       ↳ Measures every declared input in declaration order.
      └─> MeasureService.measureInput(args: MeasureInputArguments): InputMeasurement [projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:223]
         ↳ Measures one declared input with only the analyses it asked for. An analysis nobody requested is never run.
        └─> MeasureService.analyzeFiles(args: AnalyzeFilesArguments): CodeStatisticsResult [projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:60]
           ↳ Runs every analyzer over one file set and shapes the result.
          └─> LanguagesService.analyze(args: AnalyzeLanguagesArguments): LanguageResults [projects/ic-suite/codometer/codometer-languages/src/modules/languages/languages.service.ts:57]
             ↳ Analyze every language present in the discovered files.
            └─> LanguageCommentsService.measure(args: MeasureLanguageCommentsArguments): Record<string, CommentMeasurement[]> [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:191]
               ↳ Measures every counter that names no `kind`, keyed by label. A counter naming no language measures all of them.
              └─> LanguageCommentsService.flatMap(…)(…): CodometerCommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:209]
                └─> LanguageCommentsService.measureOneLanguage(…): CodometerCommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:84]
                   ↳ Measures one counter's budget against one language's discovered files.
                  └─> LanguageCommentsService.measurePython(…): CodometerCommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:146]
                     ↳ Measures Python's comments, already found by its analyzer.
                    └─> LanguageCommentsService.flatMap(…)(…): CodometerCommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:159]
                      └─> CommentsService.measure(args: MeasureCommentsArguments): CommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:128]
                         ↳ Measures every block in a file, breached or not, so lengths show before they become problems. One result per maximum.
                        └─> CommentsService.flatMap(…)(this: undefined, block: CommentBlock): CodometerCommentMeasurement[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:129]
                          └─> CommentsService.readProse(tokens: readonly CommentToken[]): string [projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:77]
                             ↳ The prose of a run of comment lines, markers already stripped.
                            └─> CommentsService.map(…)(token: CommentToken): string [projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:79]
```

**2. `ConfigurationCommand.run`** — depth ≥ 12 · decorated-method

```text
🚀 ConfigurationCommand.run(…): Promise<void> [projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:97]
   ↳ Lists the configuration beneath the directory to standard output, since the listing is read or piped, not a report.
  └─> ConfigurationListingService.describeConfigurations(args: DescribeConfigurationsArguments): Promise<ConfiguredTree> [projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:116]
     ↳ Resolves the configuration each file in a tree answers with, by its own path, matching a run given that file.
    └─> ConfigurationListingService.findConfigurationFiles(args: DescribeConfigurationsArguments): Promise<DiscoveredConfigurationFiles> [projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:138]
       ↳ Finds every file beneath a directory named like the given configuration, using the same gitignore-aware walk as a…
      └─> ConfigurationListingService.resolveWalkExclusions(args: DescribeConfigurationsArguments): Promise<WalkExclusions> [projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:88]
         ↳ Resolves the walk's exclusions, falling back to the built-in ones and reporting the failure rather than throwing.
        └─> ConfigurationService.loadConfigurationFile(args: LoadConfigurationArguments): Promise<LoadedConfiguration> [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:55]
           ↳ Loads a configuration and returns the absolute path of the file that answered, for attribution.
          └─> ConfigurationService.resolveConfiguration(configuration: CodometerConfiguration): ResolvedCodometerConfiguration [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:100]
             ↳ Fills in every field a configuration file may leave out.
            └─> ConfigurationResolverService.resolveConfiguration(configuration: CodometerConfiguration): ResolvedCodometerConfiguration [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:296]
               ↳ Fills in every field a configuration file may leave out, so a host's own object takes the same shape.
              └─> ConfigurationResolverService.resolveLimits(limits: CodometerLimit[] | undefined): ResolvedCodometerLimit[] [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:214]
                 ↳ Gives every limit its severity and a numeric value. Which metric it lands on is decided at measurement.
                └─> ConfigurationResolverService.map(…)(…): { label: string | undefined; metric: string; severity: CodometerSeverity; value: number; } [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:217]
                  └─> ConfigurationResolverService.parseLimitValue(limit: CodometerLimit): number [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:82]
                     ↳ Reads a limit's value, in decimal units when written as text. Anything unreadable is refused, not coerced to zero.
                    └─> ConfigurationResolverService.parseLimitValueText(metric: string, text: string): number [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:97]
                       ↳ Reads a limit written as text, unit included. The rounding keeps `"0.1 KB"` from arriving as a float artifact.
                      └─> InvalidLimitValueError.constructor(metric: string, value: string): InvalidLimitValueError [projects/ic-suite/codometer/codometer-core/src/modules/codometer-core/codometer-core.constants.ts:33]
```

**3. `ChangesCommand.run`** — depth ≥ 11 · decorated-method

```text
🚀 ChangesCommand.run(_passedParameters: string[], options: ChangesCommandOptions): Promise<void> [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:95]
   ↳ Diffs every project's report against the baseline, and emits the result.
  └─> ChangesService.collect(args: CollectRowsArguments): MetricCollection [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:244]
     ↳ Joins every current report to the baseline snapshot.
    └─> ChangesService.map(…)(reportPath: string): MetricCollection [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:245]
      └─> ChangesService.collectProjectRows(args: CollectProjectRowsArguments): MetricCollection [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:80]
         ↳ Joins one project's current report to its baseline. A baseline metric is removed only if this run rebuilt the project.
        └─> ChangesService.readBaseline(args: CollectProjectRowsArguments): Map<string, ReportMetric> [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:124]
           ↳ Reads a baseline report into a name-to-metric lookup.
          └─> ChangesService.readReport(workingDirectory: string, reportPath: string): ProjectReport [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:195]
             ↳ Parses a codometer report, tolerating an absent or malformed file.
            └─> ChangesService.flatMap(…)(…): ReportMetric[] [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:211]
              └─> ChangesService.readMetrics(target: ReportTarget): ReportMetric[] [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:174]
                 ↳ Pulls every metric a target produced out of the report, labelled by its limit's name, else its own dotted name.
                └─> ChangesService.map(…)(…): { breach: MetricSeverity | undefined; empty: boolean; label: string; limit: number | undefined; name: string; unit: "bytes" | null; value: number; } [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:175]
                  └─> ChangesService.readBreach(limits: readonly ReportLimit[]): MetricSeverity | undefined [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:141]
                     ↳ The worst severity a metric breached: `fail` outranks `warn`, so a metric past both reads as failing.
                    └─> ChangesService.filter(…)(…): boolean [projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:144]
```

<details>
<summary>8 more call stacks</summary>

**4. `ChangesCommand.parseDirectory`** — depth 5 · decorated-method

```text
🚀 ChangesCommand.parseDirectory(value: unknown): string [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:68]
   ↳ Parse the directory to look for codometer reports in.
  └─> ConfigurationService.parseDirectoryOption(value: unknown): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:79]
     ↳ Reads a directory option, falling back to the working directory.
    └─> ConfigurationFlagsService.parseDirectoryOption(value: unknown): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:102]
       ↳ Reads a directory option, falling back to the process's working directory as it stands when read.
      └─> ConfigurationFlagsService.parseDefaultedOption(value: unknown, fallback: string): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:95]
         ↳ Reads an option, returning `fallback` when it was left off. Each command chooses its own fallback.
        └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:109]
           ↳ Reads an option that carries text.
```

**5. `ConfigurationCommand.parseDirectory`** — depth 5 · decorated-method

```text
🚀 ConfigurationCommand.parseDirectory(value: unknown): string [projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:65]
   ↳ Parse the directory to look for configuration files beneath.
  └─> ConfigurationService.parseDirectoryOption(value: unknown): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:79]
     ↳ Reads a directory option, falling back to the working directory.
    └─> ConfigurationFlagsService.parseDirectoryOption(value: unknown): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:102]
       ↳ Reads a directory option, falling back to the process's working directory as it stands when read.
      └─> ConfigurationFlagsService.parseDefaultedOption(value: unknown, fallback: string): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:95]
         ↳ Reads an option, returning `fallback` when it was left off. Each command chooses its own fallback.
        └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:109]
           ↳ Reads an option that carries text.
```

**6. `ConfigurationCommand.parseFormat`** — depth 4 · decorated-method

```text
🚀 ConfigurationCommand.parseFormat(value: unknown): string [projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:74]
   ↳ Parse the output format the listing is rendered in.
  └─> ConfigurationService.parseDefaultedOption(value: unknown, fallback: string): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:74]
     ↳ Reads an option that carries a default when it was left off.
    └─> ConfigurationFlagsService.parseDefaultedOption(value: unknown, fallback: string): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:95]
       ↳ Reads an option, returning `fallback` when it was left off. Each command chooses its own fallback.
      └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:109]
         ↳ Reads an option that carries text.
```

**7. `ChangesCommand.parseBaseline`** — depth 3 · decorated-method

```text
🚀 ChangesCommand.parseBaseline(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:50]
   ↳ Parse the baseline directory holding a snapshot of the reports.
  └─> ConfigurationService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:84]
     ↳ Reads an option that carries text, or nothing at all.
    └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:109]
       ↳ Reads an option that carries text.
```

**8. `ChangesCommand.parseBaselineUrl`** — depth 3 · decorated-method

```text
🚀 ChangesCommand.parseBaselineUrl(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:59]
   ↳ Parse the run URL the baseline came from, linked from the summary.
  └─> ConfigurationService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:84]
     ↳ Reads an option that carries text, or nothing at all.
    └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:109]
       ↳ Reads an option that carries text.
```

**9. `ChangesCommand.parseMarkdown`** — depth 3 · decorated-method

```text
🚀 ChangesCommand.parseMarkdown(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:77]
   ↳ Parse the markdown document the report is spliced into.
  └─> ConfigurationService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:84]
     ↳ Reads an option that carries text, or nothing at all.
    └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:109]
       ↳ Reads an option that carries text.
```

**10. `ChangesCommand.parseOutput`** — depth 3 · decorated-method

```text
🚀 ChangesCommand.parseOutput(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:86]
   ↳ Parse the file the report is written to on its own.
  └─> ConfigurationService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:84]
     ↳ Reads an option that carries text, or nothing at all.
    └─> ConfigurationFlagsService.parseOptionalOption(value: unknown): string | undefined [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:109]
       ↳ Reads an option that carries text.
```

**11. `main`** — depth 2 · module-bootstrap

```text
🚀 main(): Promise<void> [projects/ic-suite/codometer/codometer-cli/src/codometer-cli.main.ts:17]
   ↳ Bootstraps the CLI.
  └─> withDefaultCommand(argv: readonly string[]): string[] [projects/ic-suite/codometer/codometer-cli/src/codometer-cli.utilities.ts:7]
     ↳ Prefixes `measure` when no command is named, since Commander will not infer one. Bare help flags are left alone.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MeasureCommand.measureDirectory` | 8 | `MeasureCommand.resolveRunPlan`, `DestinationsService.listOutputPaths`, `MeasureCommand.announceOutputPaths`, `MeasureService.measure`, `ReportService.build`, `DeliveryService.deliver`, `DestinationsService.selectScope`, `MeasureCommand.reportFindings` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:98` |
| `MeasureCommand.resolveRunPlan` | 7 | `ConfigurationService.selectMode`, `MeasureCommand.rejectCommandLine`, `MeasureCommand.readConfiguration`, `MeasureCommand.applyInputsOverride`, `ConfigurationService.resolveFormat`, `DestinationsService.resolveDestinations`, `DestinationsService.resolveConsoleMarkdown` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:243` |
| `ChangesCommand.run` | 5 | `ConfigurationService.parseOptionalOption`, `ConfigurationService.parseDirectoryOption`, `ChangesService.collect`, `RenderService.renderSection`, `DocumentsService.emit` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:95` |

<details>
<summary>13 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationCommand.run` | 5 | `ConfigurationService.requireConfigurationPath`, `ConfigurationListingService.describeConfigurations`, `ConfigurationCommand.filter(…)`, `RenderConfigurationService.render`, `ConfigurationListingService.toLimitRows` | `projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:97` |
| `MeasureCommand.reportFindings` | 4 | `MeasureCommand.reportFailures`, `MeasureCommand.reportStaleness`, `MeasureCommand.reportBreaches`, `MeasureCommand.filter(…)` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:213` |
| `MeasureCommand.reportBreaches` | 3 | `MeasureCommand.filter(…)`, `MeasureCommand.filter(…)`, `MeasureCommand.filter(…)` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:172` |
| `MeasureCommand.run` | 3 | `MeasureCommand.measureDirectory`, `MeasureCommand.resolveWorkingDirectory`, `MeasureCommand.map(…)` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:381` |
| `MeasureCommand.readConfiguration` | 2 | `ConfigurationService.requireConfigurationPath`, `ConfigurationService.loadConfiguration` | `projects/ic-suite/codometer/codometer-cli/src/modules/measure/measure.command.ts:139` |
| `ChangesCommand.parseBaseline` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:50` |
| `ChangesCommand.parseBaselineUrl` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:59` |
| `ChangesCommand.parseDirectory` | 1 | `ConfigurationService.parseDirectoryOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:68` |
| `ChangesCommand.parseMarkdown` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:77` |
| `ChangesCommand.parseOutput` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/changes/changes.command.ts:86` |
| `ConfigurationCommand.parseDirectory` | 1 | `ConfigurationService.parseDirectoryOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:65` |
| `ConfigurationCommand.parseFormat` | 1 | `ConfigurationService.parseDefaultedOption` | `projects/ic-suite/codometer/codometer-cli/src/modules/configuration/configuration.command.ts:74` |
| `main` | 1 | `withDefaultCommand` | `projects/ic-suite/codometer/codometer-cli/src/codometer-cli.main.ts:17` |

</details>
<!-- callidescope:end -->
