import { Injectable } from "@nestjs/common";

import { InputService } from "../input/input.service";
import { RunPlanService } from "../run-plan/run-plan.service";

import { ConfigurationFileService } from "./configuration-file.service";
import { CALLIDESCOPE_OUTPUT_FORMATS } from "./configuration.constants";
import { ProjectConfigurationService } from "./project-configuration.service";

import type { CallidescopeFormatOptions } from "../input/input.types";
import type {
  AddressCommandOptions,
  CallidescopeCommandOptions,
  PreparedLookup,
  RunMode,
  RunPreparation,
} from "../run-plan/run-plan.types";
import type { ConfigurationFileReader } from "./configuration-file.types";
import type {
  CallidescopeConfiguration,
  LoadConfigurationArguments,
  LoadedCallidescopeConfiguration,
  LoadedProjectConfiguration,
  LoadProjectConfigurationsArguments,
  ProjectLimitsLookup,
  ResolvedCallidescopeConfiguration,
  ResolveProjectLimitsArguments,
} from "./configuration.types";

/**
 * The one answer to "what is this run actually configured to do".
 *
 * Callers inject this rather than the collaborators behind it. Nearly every method forwards;
 * `resolveFormatOption` is the one with a decision of its own.
 */
@Injectable()
export class ConfigurationService implements ConfigurationFileReader {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationFileService: ConfigurationFileService,
    private readonly inputService: InputService,
    private readonly projectConfigurationService: ProjectConfigurationService,
    private readonly runPlanService: RunPlanService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Finds a configuration file sitting directly at one directory. */
  public findConfigurationFileAt(directory: string): string | undefined {
    return this.configurationFileService.findConfigurationFileAt(directory);
  }

  /**
   * Loads a configuration, and says what the file itself declared and which
   * file answered.
   */
  public async loadConfigurationFile(
    args: LoadConfigurationArguments,
  ): Promise<LoadedCallidescopeConfiguration> {
    return await this.configurationFileService.loadConfigurationFile(args);
  }

  /** Loads and validates every traced project's own configuration file. */
  public async loadProjectConfigurations(
    args: LoadProjectConfigurationsArguments,
  ): Promise<LoadedProjectConfiguration[]> {
    return await this.projectConfigurationService.loadProjectConfigurations(
      args,
      this,
    );
  }

  /** Splits a comma-separated flag value into its parts. */
  public parseCommaDelimitedOption(value: string | undefined): string[] {
    return this.inputService.parseCommaDelimitedOption(value);
  }

  /** Reads a flag that may have been written without a value. */
  public parseOptionalOption(value: string | undefined): string | undefined {
    return this.inputService.parseOptionalOption(value);
  }

  /** Reads a lookup's scoping flags into a workspace root and a configuration. */
  public async prepareLookup(
    options: AddressCommandOptions,
  ): Promise<PreparedLookup> {
    return await this.runPlanService.prepareLookup(options, this);
  }

  /** Reads a command line and its configuration into what the run will do. */
  public async prepareRun(
    options: CallidescopeCommandOptions,
  ): Promise<RunPreparation> {
    return await this.runPlanService.prepareRun(options, this);
  }

  /** Prompts for several values at once, completing the list as it is typed. */
  public async promptForAutocompleteMultiselect(args: {
    message: string;
    subject: string;
    suggestions: readonly string[];
  }): Promise<string[]> {
    return await this.inputService.promptForAutocompleteMultiselect(args);
  }

  /** Prompts for one value out of a fixed set of choices. */
  public async promptForSelect<Choice extends string>(args: {
    choices: readonly Choice[];
    message: string;
    subject: string;
  }): Promise<Choice> {
    return await this.inputService.promptForSelect(args);
  }

  /** Reads the configuration path, refusing an absent or blank one by surface. */
  public requireConfigurationPath(
    path: string | undefined,
    surface: string,
  ): string {
    return this.inputService.requireConfigurationPath(path, surface);
  }

  /** Fills in every field a configuration file may leave out. */
  public resolveConfiguration(
    configuration: CallidescopeConfiguration,
  ): ResolvedCallidescopeConfiguration {
    return this.configurationFileService.resolveConfiguration(configuration);
  }

  /**
   * Fills `--format` in where wanted.
   * Offered, not required: scripted runs without a terminal keep the caller's default.
   */
  public async resolveFormatOption<Options extends CallidescopeFormatOptions>(
    options: Options,
  ): Promise<Options> {
    if (options.format !== undefined || !this.inputService.isAtTerminal()) {
      return options;
    }

    const format = await this.promptForSelect({
      choices: CALLIDESCOPE_OUTPUT_FORMATS,
      message: "Which output format?",
      subject: "An output format (--format)",
    });

    return { ...options, format };
  }

  /** Resolves the limits every traced project is judged against. */
  public resolveLimits(
    args: ResolveProjectLimitsArguments,
  ): ProjectLimitsLookup {
    return this.projectConfigurationService.resolveLimits(args);
  }

  /** Whether a run reads or rewrites the files its reports live in. */
  public touchesFiles(mode: RunMode): boolean {
    return this.runPlanService.touchesFiles(mode);
  }
}
