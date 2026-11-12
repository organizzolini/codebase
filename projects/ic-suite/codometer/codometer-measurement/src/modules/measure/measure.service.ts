import { DEFAULT_INPUT_NAME } from "@codometer/configuration";
import { LanguagesService } from "@codometer/languages";
import { Injectable } from "@nestjs/common";

import { CustomizationService } from "../customization/customization.service";
import { DiscoveryService } from "../discovery/discovery.service";
import { InputsService } from "../inputs/inputs.service";
import { LimitsService } from "../limits/limits.service";
import { MetricIndexService } from "../limits/metric-index.service";
import { SizeService } from "../size/size.service";

import { EMPTY_CODE_STATISTICS_RESULT } from "./measure.constants";

import type { LimitFailure } from "../limits/limits.types";
import type {
  AnalyzeFilesArguments,
  InputMeasurement,
  MeasureArguments,
  MeasureInputArguments,
  MeasurementResult,
} from "./measure.types";
import type {
  CodometerAnalysis,
  ResolvedCodometerInput,
} from "@codometer/configuration";
import type { CodeStatisticsResult, ReportFailure } from "@codometer/core";
import type {
  CommentMeasurement,
  TypescriptResult,
} from "@codometer/languages";

/**
 * Aggregates every analyzer's report into a single set of statistics.
 *
 * The one place the analyzers meet. None imports another, so the join lives here.
 */
@Injectable()
export class MeasureService {
  // 🏗 Dependency Injection

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly languagesService: LanguagesService,
    private readonly customizationService: CustomizationService,
    private readonly inputsService: InputsService,
    private readonly sizeService: SizeService,
    private readonly limitsService: LimitsService,
    private readonly metricIndexService: MetricIndexService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Runs every analyzer over one file set and shapes the result. Takes the files it is given, so codebase and input are counted identically.
   */
  private analyzeFiles(args: AnalyzeFilesArguments): CodeStatisticsResult {
    const directory = args.workingDirectory;
    const { discoveredFiles } = args;
    const languages = this.languagesService.analyze({
      commentCounters: args.commentCounters,
      configuration: args.configuration,
      discoveredFiles,
      symbolCounters: args.symbolCounters,
      workingDirectory: directory,
    });
    // `none` compression is size analysis's own way of saying "uncompressed",
    // which is what a headline byte total is: the reader is not asking what
    // this input compresses to, only how large it is.
    const size = this.sizeService.analyze({
      compression: "none",
      files: discoveredFiles.files,
      workingDirectory: directory,
    });
    // A comment-selector custom statistic's own breaches, merged back by
    // label: a counter naming a declaration kind and one naming a language are
    // measured through two different calls, but a label belongs to exactly
    // one custom statistic either way.
    const commentCounts: Record<string, CommentMeasurement[]> = {
      ...languages.commentCounts,
      ...languages.typescript.declarationCommentCounts,
    };

    return {
      css: { ...languages.css },
      custom: this.customizationService.analyze({
        commentCounts,
        files: discoveredFiles.files,
        statistics: args.statistics,
        symbolCounts: languages.typescript.symbolCounts,
      }),
      folders: this.getFolderCount(discoveredFiles.files),
      hcl: { ...languages.hcl },
      javascript: this.buildJavascriptStatistics(languages.typescript),
      // The JSON, Jupyter, markdown, and Python analyzers already report
      // exactly the shape their group declares, so nothing is projected.
      json: { ...languages.json },
      jupyter: { ...languages.jupyter },
      // Notebook code is source too: its lines are counted once here, and
      // the cells they came from are never handed to the standalone
      // analyzers.
      linesOfCode:
        languages.typescript.lines +
        languages.python.lines +
        languages.jupyter.codeLines,
      markdown: { ...languages.markdown },
      python: { ...languages.python },
      repositoryBytes: size.bytes,
      shell: { ...languages.shell },
      sourceFiles:
        languages.typescript.tsFiles +
        languages.typescript.jsFiles +
        languages.python.files,
      sql: { ...languages.sql },
      toml: { ...languages.toml },
      typescript: this.buildTypescriptStatistics(languages.typescript),
      yaml: { ...languages.yaml },
    };
  }

  /** Project the TypeScript analyzer's counters onto the JavaScript group. */
  private buildJavascriptStatistics(
    typescriptStats: TypescriptResult,
  ): CodeStatisticsResult["javascript"] {
    return {
      asyncFunctions: typescriptStats.asyncFunctions,
      classes: typescriptStats.classes,
      commentLines: typescriptStats.commentLines,
      comments: typescriptStats.comments,
      constants: typescriptStats.constants,
      exported: typescriptStats.exported,
      externalPackages: typescriptStats.externalPackages.size,
      files: typescriptStats.jsFiles,
      functions: typescriptStats.functions,
      imports: typescriptStats.imports,
      methods: typescriptStats.methods,
      syncFunctions: typescriptStats.syncFunctions,
      testFiles: typescriptStats.testFiles,
      todos: typescriptStats.todos,
    };
  }

  /** Project the TypeScript analyzer's counters onto the TypeScript group. */
  private buildTypescriptStatistics(
    typescriptStats: TypescriptResult,
  ): CodeStatisticsResult["typescript"] {
    return {
      decorators: typescriptStats.decorators,
      docComments: typescriptStats.docComments,
      enums: typescriptStats.enums,
      files: typescriptStats.tsFiles,
      genericDeclarations: typescriptStats.genericDeclarations,
      interfaces: typescriptStats.interfaces,
    };
  }

  /** Reads whatever an input's measurement threw as a printable sentence. */
  private describeFailure(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Discovers one input's files, minus codometer's own outputs. The built-in `codebase` input uses its ignore files, not its globs.
   */
  private discoverInputFiles(
    input: ResolvedCodometerInput,
    args: MeasureInputArguments,
  ): string[] {
    const discovered =
      input.name === DEFAULT_INPUT_NAME
        ? this.discoveryService.discoverFiles({
            exclude: args.configuration.exclude,
            excludeFrom: args.configuration.excludeFrom,
            workingDirectory: args.workingDirectory,
          }).files
        : this.inputsService.matchFiles({
            input,
            workingDirectory: args.workingDirectory,
          });

    return this.excludeOutputPaths(discovered, args.outputPaths);
  }

  /**
   * Drops codometer's own report files from measured ones, so a second run over an untouched tree yields the same bytes.
   */
  private excludeOutputPaths(
    files: string[],
    outputPaths: readonly string[],
  ): string[] {
    if (outputPaths.length === 0) {
      return files;
    }

    const excluded = new Set(outputPaths);

    return files.filter((filePath) => !excluded.has(filePath));
  }

  /**
   * Count the unique folders the input's files sit in.
   */
  private getFolderCount(files: string[]): number {
    const folders = new Set<string>();

    for (const filePath of files) {
      const parts = filePath.split("/");

      for (let index = 1; index < parts.length; index++) {
        folders.add(parts.slice(0, index).join("/"));
      }
    }

    return folders.size;
  }

  /**
   * Measures one declared input with only the analyses it asked for. An analysis nobody requested is never run.
   */
  private measureInput(args: MeasureInputArguments): InputMeasurement {
    const { input } = args;
    const files = this.discoverInputFiles(input, args);
    const language = this.runsAnalysis(input, "language")
      ? this.analyzeFiles({
          commentCounters: args.commentCounters,
          configuration: args.configuration,
          discoveredFiles: this.discoveryService.categorize(files),
          statistics: args.statistics,
          symbolCounters: args.symbolCounters,
          workingDirectory: args.workingDirectory,
        })
      : undefined;

    return {
      files: files.length,
      language,
      name: input.name,
      size: this.runsAnalysis(input, "size")
        ? this.sizeService.analyze({
            compression: input.compression,
            files,
            workingDirectory: args.workingDirectory,
          })
        : undefined,
    };
  }

  /** Restates the limits layer's failures in the report's own vocabulary. */
  private readLimitFailures(
    failures: readonly LimitFailure[],
  ): ReportFailure[] {
    return failures.map((failure) => ({
      kind: "limit",
      reason: failure.reason,
      subject: failure.metric,
    }));
  }

  /** Whether an input asked for one of the analyses. */
  private runsAnalysis(
    input: ResolvedCodometerInput,
    analysis: CodometerAnalysis,
  ): boolean {
    return input.analyses.includes(analysis);
  }

  // 🌎 Public Methods

  /**
   * Measures every declared input in declaration order. A failing input is recorded and skipped, so one bad file cannot end the run.
   */
  measure(args: MeasureArguments): MeasurementResult {
    // Every custom statistic the configuration declares, regardless of which
    // output — if any — selects it back out by label: a counter is measured
    // once it is declared, not once it belongs to some output's selection.
    const statistics = args.configuration.custom;
    const commentCounters =
      this.customizationService.buildCommentCounters(statistics);
    const symbolCounters =
      this.customizationService.buildSymbolCounters(statistics);
    const failures: ReportFailure[] = [];
    const inputs: InputMeasurement[] = [];

    for (const input of args.configuration.inputs) {
      try {
        inputs.push(
          this.measureInput({
            commentCounters,
            configuration: args.configuration,
            input,
            outputPaths: args.outputPaths,
            statistics,
            symbolCounters,
            workingDirectory: args.workingDirectory,
          }),
        );
      } catch (error: unknown) {
        failures.push({
          kind: "input",
          reason: this.describeFailure(error),
          subject: input.name,
        });
      }
    }

    const { duplicates, indexes } = this.metricIndexService.index(inputs);
    // Evaluated here rather than by whoever renders the report, so that a
    // limit addressing a metric nothing measured is a failure of the
    // measurement rather than of one output format.
    const evaluation = this.limitsService.evaluate({
      configuration: args.configuration,
      indexes,
    });
    // The first input, in declaration order, that ran language analysis.
    // Never looked up by the name `codebase`, since `--inputs` replaces that input. Where several ran, the first declared wins.
    const languageMeasured = inputs.find(
      (measured) => measured.language !== undefined,
    );

    return {
      failures: [
        ...failures,
        ...duplicates.map((duplicate) => ({
          kind: "input" as const,
          reason: duplicate.reason,
          subject: duplicate.target,
        })),
        ...this.readLimitFailures(evaluation.failures),
      ],
      indexes,
      inputs,
      limits: evaluation.limits,
      statistics: languageMeasured?.language ?? EMPTY_CODE_STATISTICS_RESULT,
    };
  }
}
