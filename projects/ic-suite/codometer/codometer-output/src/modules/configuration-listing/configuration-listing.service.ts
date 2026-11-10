import path from "node:path";

import {
  ConfigurationService as CodometerConfigurationService,
  CONFIGURATION_FILE_NAMES,
  DEFAULT_EXCLUDE_GLOBS,
} from "@codometer/configuration";
import { DiscoveryService } from "@codometer/measurement";
import { Injectable } from "@nestjs/common";

import { formatBytes, formatCount } from "../render/render.utilities";

import {
  ABSENT_LABEL,
  SIZE_METRIC_SUFFIX,
} from "./configuration-listing.constants";

import type {
  ConfiguredDirectory,
  ConfiguredLimitRow,
  ConfiguredTree,
  DescribeConfigurationsArguments,
  DiscoveredConfigurationFiles,
  WalkExclusions,
} from "./configuration-listing.types";

/**
 * Finds every codometer configuration in a tree and what each one holds. Never measures, so it runs in milliseconds.
 *
 * A bad file is reported on the result rather than thrown, so one unreadable file cannot take the listing down.
 */
@Injectable()
export class ConfigurationListingService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: CodometerConfigurationService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  // 🔐 Private Fields

  /** Every name a configuration file may be written under, as a set. */
  private readonly configurationFileNames = new Set<string>(
    CONFIGURATION_FILE_NAMES,
  );

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Resolves one configuration file, reporting a failure on its entry rather than throwing, so one bad file cannot hide the rest.
   */
  private async describeConfiguration(args: {
    directory: string;
    file: string;
    workingDirectory: string;
  }): Promise<ConfiguredDirectory> {
    try {
      const { configuration } =
        await this.configurationService.loadConfigurationFile({
          configurationPath: path.resolve(args.workingDirectory, args.file),
        });

      return {
        configuration,
        directory: args.directory,
        error: undefined,
        path: args.file,
      };
    } catch (error) {
      return {
        configuration: undefined,
        directory: args.directory,
        error: error instanceof Error ? error.message : String(error),
        path: args.file,
      };
    }
  }

  /**
   * Renders a limit with its metric's unit. Only size analysis produces a `.size` metric, so the suffix is a sound test.
   */
  private formatLimitValue(metric: string, value: number): string {
    return metric.endsWith(SIZE_METRIC_SUFFIX)
      ? formatBytes(value)
      : formatCount(value);
  }

  /**
   * Resolves the walk's exclusions, falling back to the built-in ones and reporting the failure rather than throwing.
   */
  private async resolveWalkExclusions(
    args: DescribeConfigurationsArguments,
  ): Promise<WalkExclusions> {
    try {
      const { configuration } =
        await this.configurationService.loadConfigurationFile({
          configurationPath: args.configurationPath,
        });

      return {
        error: undefined,
        exclude: configuration.exclude,
        excludeFrom: configuration.excludeFrom,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        exclude: [...DEFAULT_EXCLUDE_GLOBS],
        excludeFrom: [],
      };
    }
  }

  // 🌎 Public Methods

  /**
   * Resolves the configuration each file in a tree answers with, by its own path, matching a run given that file.
   */
  public async describeConfigurations(
    args: DescribeConfigurationsArguments,
  ): Promise<ConfiguredTree> {
    const { files, rootError } = await this.findConfigurationFiles(args);
    const described: ConfiguredDirectory[] = [];

    for (const file of files) {
      described.push(
        await this.describeConfiguration({
          directory: path.dirname(file),
          file,
          workingDirectory: args.workingDirectory,
        }),
      );
    }

    return { described, rootError };
  }

  /**
   * Finds every configuration file beneath a directory, using the same gitignore-aware walk as a measurement. Exclusions come from the walk root's configuration.
   */
  public async findConfigurationFiles(
    args: DescribeConfigurationsArguments,
  ): Promise<DiscoveredConfigurationFiles> {
    const exclusions = await this.resolveWalkExclusions(args);
    const { files } = this.discoveryService.discoverFiles({
      exclude: exclusions.exclude,
      excludeFrom: exclusions.excludeFrom,
      workingDirectory: args.workingDirectory,
    });

    return {
      files: files
        .filter((file) => this.configurationFileNames.has(path.basename(file)))
        .toSorted((first, second) => first.localeCompare(second)),
      rootError: exclusions.error,
    };
  }

  /** Flattens every configured limit into one row per limit, in walk order. */
  public toLimitRows(
    described: readonly ConfiguredDirectory[],
  ): ConfiguredLimitRow[] {
    return described.flatMap((entry) =>
      (entry.configuration?.limits ?? []).map((limit) => ({
        directory: entry.directory,
        label: limit.label ?? ABSENT_LABEL,
        metric: limit.metric,
        path: entry.path,
        severity: limit.severity,
        value: this.formatLimitValue(limit.metric, limit.value),
      })),
    );
  }
}
