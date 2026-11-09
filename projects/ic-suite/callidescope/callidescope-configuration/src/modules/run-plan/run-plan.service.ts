import { Injectable } from "@nestjs/common";

import { flagResolutionError } from "../flag-resolution/flag-resolution.constants";
import { FlagResolutionService } from "../flag-resolution/flag-resolution.service";

import {
  CHECK_BREADTH,
  CHECK_DEPTH,
  CHECK_NAMES,
  CHECK_REPORTS,
  CHECK_SEPARATOR,
  DESTINATION_FLAG_NAMES,
} from "./run-plan.constants";

import type { ConfigurationFileReader } from "../configuration/configuration-file.types";
import type {
  AddressCommandOptions,
  CallidescopeCommandOptions,
  PreparedLookup,
  RunMode,
  RunModeSelection,
  RunPreparation,
} from "./run-plan.types";

/**
 * Reads a command line and its configuration into what the run will do.
 * `ConfigurationService` fronts this, so a double of that one object covers it too.
 */
@Injectable()
export class RunPlanService {
  // 🏗 Dependency Injection

  constructor(private readonly flagResolutionService: FlagResolutionService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** States what `--check` accepts, in front of whatever went wrong. */
  private describeAcceptedCheckNames(problem: string): string {
    return `${problem}. It takes a comma-separated set drawn from ${CHECK_NAMES.map((name) => `"${name}"`).join(" and ")}, as in "--check ${CHECK_NAMES.join(CHECK_SEPARATOR)}".`;
  }

  /**
   * Reads `--check` into the checks the run fails on. A valueless or empty flag is refused, not read as no gate.
   */
  private readCheckNames(
    value: string | true | undefined,
    errors: string[],
  ): Set<string> {
    if (value === undefined) {
      return new Set();
    }

    if (value === true) {
      errors.push(this.describeAcceptedCheckNames("--check needs a value"));
      return new Set();
    }

    const names = value
      .split(CHECK_SEPARATOR)
      .map((name) => name.trim())
      .filter((name) => name !== "");

    // An empty or comma-only value is refused like a valueless flag. Read as no gate,
    // it would pass forever over any stack.
    if (names.length === 0) {
      errors.push(this.describeAcceptedCheckNames("--check needs a value"));
      return new Set();
    }

    return this.validateCheckNames(names, errors);
  }

  /** Keeps the names `--check` knows and complains about the rest. */
  private validateCheckNames(names: string[], errors: string[]): Set<string> {
    const accepted = new Set<string>();

    for (const name of names) {
      if (CHECK_NAMES.includes(name)) {
        accepted.add(name);
        continue;
      }

      errors.push(
        this.describeAcceptedCheckNames(`--check does not accept "${name}"`),
      );
    }

    return accepted;
  }

  // 🌎 Public Methods

  /**
   * Reads a lookup's scoping flags into a workspace root and configuration. A bad command line throws.
   */
  public async prepareLookup(
    options: AddressCommandOptions,
    reader: ConfigurationFileReader,
  ): Promise<PreparedLookup> {
    const workspaceRoot = process.cwd();
    // The file-aware load, so the lookup knows which file it already read as the run's own.
    // Otherwise that file is read again as a project's and refused.
    const {
      authored,
      configuration: loaded,
      path: configurationPath,
    } = await reader.loadConfigurationFile({
      configurationPath: options.config,
    });
    const { configuration, errors, format } =
      this.flagResolutionService.resolveRunFlags({
        configuration: loaded,
        // Every graph-shaping override a lookup accepts, and nothing else:
        // `depth` and `breadth` gate nothing and write nothing, so a limit or
        // a destination has no value here to override.
        flags: {
          directories: options.directories,
          entryPointAddresses: options.entryPointAddresses,
          entryPointDecorators: options.entryPointDecorators,
          exclude: options.exclude,
          excludeCallees: options.excludeCallees,
          format: options.format,
          includeExportedFunctions: options.includeExportedFunctions,
          includeOrphans: options.includeOrphans,
          includeTests: options.includeTests,
        },
      });

    if (errors.length > 0) {
      throw flagResolutionError(errors);
    }

    return {
      authoredLimits: authored.limits,
      configuration,
      configurationPath,
      format,
      workspaceRoot,
    };
  }

  /**
   * Reads the command line and configuration into what the run will do. Refusals are returned rather than reported.
   */
  public async prepareRun(
    options: CallidescopeCommandOptions,
    reader: ConfigurationFileReader,
  ): Promise<RunPreparation> {
    const { errors: modeErrors, mode } = this.selectMode(options);

    if (modeErrors.length > 0) {
      return { errors: modeErrors, run: undefined };
    }

    const workspaceRoot = process.cwd();

    // The file-aware load rather than the plain one: the trace resolves a
    // configuration beside every project it reaches, and needs to know which
    // file it has already read as this run's own so it is not read twice.
    const {
      authored,
      configuration: loaded,
      path: configurationPath,
    } = await reader.loadConfigurationFile({
      configurationPath: options.config,
    });
    // Every combination of a flag with a configured value happens here and
    // nowhere else, under one precedence rule this service does not restate.
    const { configuration, errors, format, limitOverrides } =
      this.flagResolutionService.resolveRunFlags({
        configuration: loaded,
        flags: {
          // The mode flags are handed over with the rest rather than held
          // back, so the resolver is given the whole command line and the
          // rule that it changes nothing for them is exercised rather than
          // merely written down. `selectMode` above is what reads them.
          check: options.check,
          directories: options.directories,
          entryPointAddresses: options.entryPointAddresses,
          entryPointDecorators: options.entryPointDecorators,
          exclude: options.exclude,
          excludeCallees: options.excludeCallees,
          format: options.format,
          includeExportedFunctions: options.includeExportedFunctions,
          includeOrphans: options.includeOrphans,
          includeTests: options.includeTests,
          json: options.json,
          markdown: options.markdown,
          maximumBreadth: options.maximumBreadth,
          maximumDepth: options.maximumDepth,
          mermaid: options.mermaid,
          write: options.write,
        },
      });

    if (errors.length > 0) {
      return { errors, run: undefined };
    }

    return {
      errors,
      run: {
        authoredLimits: authored.limits,
        configuration,
        configurationPath,
        format,
        limitOverrides,
        mode,
        workspaceRoot,
      },
    };
  }

  /**
   * Reads the flags into what the run writes and fails on. `--write` with `--check reports` is refused.
   */
  public selectMode(
    options: Partial<CallidescopeCommandOptions>,
  ): RunModeSelection {
    const errors: string[] = [];
    const names = this.readCheckNames(options.check, errors);
    const writes = options.write === true;

    if (writes && names.has(CHECK_REPORTS)) {
      errors.push(
        `--write cannot be combined with --check ${CHECK_REPORTS}: a report cannot be stale in the run that just wrote it. Drop one of them, or run --write and --check ${CHECK_REPORTS} separately.`,
      );
    }

    // Destination flags with no verb are refused: they used to exit 0 and write nothing.
    // `--write` and `--check reports` are the verbs.
    const namedDestinations = DESTINATION_FLAG_NAMES.filter(
      (flag) => options[flag] !== undefined,
    );

    if (namedDestinations.length > 0 && !writes && !names.has(CHECK_REPORTS)) {
      const single = namedDestinations.length === 1;

      errors.push(
        `${namedDestinations.map((flag) => `--${flag}`).join(" and ")} ${single ? "names a destination" : "name destinations"} but nothing writes or compares ${single ? "it" : "them"}. Add --write to write ${single ? "it" : "them"}, or --check ${CHECK_REPORTS} to fail on ${single ? "it" : "them"} being out of date.`,
      );
    }

    return {
      errors,
      mode: {
        checksBreadth: names.has(CHECK_BREADTH),
        checksDepth: names.has(CHECK_DEPTH),
        checksReports: names.has(CHECK_REPORTS),
        writes,
      },
    };
  }

  /**
   * Whether a run reads or rewrites its report files. A bare run leaves every destination alone, which makes it safe to type anywhere.
   */
  public touchesFiles(mode: RunMode): boolean {
    return mode.checksReports || mode.writes;
  }
}
