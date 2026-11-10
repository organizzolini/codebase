import { Injectable } from "@nestjs/common";

import { ConfigurationFlagsService } from "./configuration-flags.service";
import { ConfigurationLoaderService } from "./configuration-loader.service";
import { ConfigurationResolverService } from "./configuration-resolver.service";

import type {
  CodometerConfiguration,
  CodometerFormat,
  LoadConfigurationArguments,
  MeasureCommandOptions,
  MeasureFormat,
  ModeSelection,
} from "./configuration.types";
import type {
  LoadedConfiguration,
  ResolvedCodometerConfiguration,
} from "./resolved.types";

/**
 * Answers what a codometer run is configured to do: the file says what to measure, the flags say what to do with it. Composes the loader, resolver and flags services, so commands inject only this class.
 */
@Injectable()
export class ConfigurationService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationLoaderService: ConfigurationLoaderService,
    private readonly configurationResolverService: ConfigurationResolverService,
    private readonly configurationFlagsService: ConfigurationFlagsService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Loads and validates the configuration file at a required path. No ancestor is searched and no default is assumed.
   */
  public async loadConfiguration(
    args: LoadConfigurationArguments,
  ): Promise<ResolvedCodometerConfiguration> {
    const { configuration } = await this.loadConfigurationFile(args);

    return configuration;
  }

  /**
   * Loads a configuration and returns the absolute path of the file that answered, for attribution.
   */
  public async loadConfigurationFile(
    args: LoadConfigurationArguments,
  ): Promise<LoadedConfiguration> {
    const loaded = await this.configurationLoaderService.load(args);

    return {
      configuration: this.resolveConfiguration(
        this.parseConfiguration(loaded.configuration),
      ),
      path: loaded.path,
    };
  }

  /** Validates a configuration object, refusing it in prose rather than JSON. */
  public parseConfiguration(configuration: unknown): CodometerConfiguration {
    return this.configurationResolverService.parseConfiguration(configuration);
  }

  /** Reads an option that carries a default when it was left off. */
  public parseDefaultedOption(value: unknown, fallback: string): string {
    return this.configurationFlagsService.parseDefaultedOption(value, fallback);
  }

  /** Reads a directory option, falling back to the working directory. */
  public parseDirectoryOption(value: unknown): string {
    return this.configurationFlagsService.parseDirectoryOption(value);
  }

  /** Reads an option that carries text, or nothing at all. */
  public parseOptionalOption(value: unknown): string | undefined {
    return this.configurationFlagsService.parseOptionalOption(value);
  }

  /** Returns the configuration path a run named, or refuses a run naming none. */
  public requireConfigurationPath(
    value: string | undefined,
    surface: string,
  ): string {
    return this.configurationFlagsService.requireConfigurationPath(
      value,
      surface,
    );
  }

  /** Fills in every field a configuration file may leave out. */
  public resolveConfiguration(
    configuration: CodometerConfiguration,
  ): ResolvedCodometerConfiguration {
    return this.configurationResolverService.resolveConfiguration(
      configuration,
    );
  }

  /** Reads `--format` into what the run prints, or the configured format. */
  public resolveFormat(
    value: string | undefined,
    configuredFormat: CodometerFormat,
    errors: string[],
  ): MeasureFormat | undefined {
    return this.configurationFlagsService.resolveFormat(
      value,
      configuredFormat,
      errors,
    );
  }

  /** Reads the flags into what the run writes and what it fails on. */
  public selectMode(options: MeasureCommandOptions): ModeSelection {
    return this.configurationFlagsService.selectMode(options);
  }
}
