import { ConfigurationService } from "@callidescope/configuration";
import { AddressDepthService } from "@callidescope/graph";
import { AddressReportService } from "@callidescope/output";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { REJECTED_ADDRESS } from "../address-lookup/address-lookup.constants";
import { AddressLookupService } from "../address-lookup/address-lookup.service";
import { readRefusalHeadline } from "../callidescope/callidescope.constants";

import type { LocatedWorkspace } from "../address-lookup/address-lookup.types";
import type { AddressCommandOptions } from "@callidescope/configuration";
import type { CallableId } from "@callidescope/core";
import type { LogData } from "@codebase/observability";

/**
 * CLI entry point that prints the call stacks above and below one callable.
 */
@Command({
  description:
    "Print every call stack above and below one or more callables, each addressed as <file>#<qualified-name>",
  name: "depth",
})
@Injectable()
export class DepthCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly addressLookupService: AddressLookupService,
    private readonly addressReportService: AddressReportService,
    private readonly addressDepthService: AddressDepthService,
    private readonly configurationService: ConfigurationService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(DepthCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Matches every address, or fails the run naming each one that did not match.
   * All or nothing, so no partial report is printed.
   */
  private identifyAddresses(args: {
    addresses: readonly string[];
    workspace: LocatedWorkspace;
  }): undefined | { address: string; id: CallableId }[] {
    const identified: { address: string; id: CallableId }[] = [];
    const problems: string[] = [];

    for (const address of args.addresses) {
      const resolution = this.addressLookupService.resolve({
        address,
        workspace: args.workspace,
      });
      const problem = this.addressLookupService.describeProblem({
        address,
        resolution,
      });

      if (problem !== undefined || resolution.kind !== "resolved") {
        problems.push(problem ?? `"${address}" resolved to nothing.`);
        continue;
      }

      identified.push({ address, id: resolution.id });
    }

    if (problems.length > 0) {
      this.reject(REJECTED_ADDRESS, { problems });
      return undefined;
    }

    return identified;
  }

  /** Traces every path above and below each resolved address, and prints them. */
  private async printDepth(options: AddressCommandOptions): Promise<void> {
    const resolvedOptions =
      await this.configurationService.resolveFormatOption(options);
    // Traced before the addresses are read, not after: the trace is what the
    // prompt completes against, and it is the same trace the lookup needs, so
    // asking first would either offer nothing or cost a second one.
    const workspace = await this.addressLookupService.locate(resolvedOptions);
    const addresses = await this.resolveAddresses({
      options: resolvedOptions,
      workspace,
    });
    const identified = this.identifyAddresses({ addresses, workspace });

    if (identified === undefined) {
      return;
    }

    process.stdout.write(
      this.addressReportService.renderDepthReports({
        format: workspace.format,
        reports: identified.map(({ address, id }) => ({
          address,
          downward: this.addressDepthService.buildDownwardStacks({
            callablesById: workspace.located.callablesById,
            graph: workspace.located.graph,
            startId: id,
          }),
          upward: this.addressDepthService.buildUpwardStacks({
            callablesById: workspace.located.callablesById,
            graph: workspace.located.graph,
            startId: id,
          }),
        })),
      }),
    );
  }

  /**
   * Logs one refusal under its headline and fails the run.
   * Shows a message, not a stack trace, since the cause is user input.
   */
  private reject(headline: string, data: LogData): void {
    this.logger.error(headline, undefined, data);
    process.exitCode = 1;
  }

  /**
   * Reads `--addresses`, prompting with the traced callables when the flag is absent.
   * Refuses rather than prompting when stdin is not a terminal.
   */
  private async resolveAddresses(args: {
    options: AddressCommandOptions;
    workspace: LocatedWorkspace;
  }): Promise<readonly string[]> {
    const addresses = args.options.addresses ?? [];

    if (addresses.length > 0) {
      return addresses;
    }

    return this.configurationService.promptForAutocompleteMultiselect({
      message: "Which callables? (file#qualified-name)",
      subject:
        'At least one callable address, as in "depth --addresses src/foo.service.ts#FooService.bar"',
      suggestions: this.addressLookupService.listAddresses(args.workspace),
    });
  }

  // 🌎 Public Methods

  /** Parses `--addresses`, a comma-separated list of callable addresses. */
  @Option({
    description:
      "Comma-separated callable addresses, each <file>#<qualified-name>",
    flags: "-a, --addresses [addresses]",
  })
  public parseAddresses(value: string | undefined): string[] {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /** Parses `--config`, which every command that loads a configuration requires. */
  @Option({
    description:
      "Path to the workspace callidescope configuration file (required)",
    flags: "--config <config>",
    required: true,
  })
  public parseConfig(value: string | undefined): string {
    return this.configurationService.requireConfigurationPath(
      value,
      "--config",
    );
  }

  /** Parses `--directories`, a comma-separated list of project directories. */
  @Option({
    description: "Comma-separated project directories to trace",
    flags: "-d, --directories [directories]",
  })
  public parseDirectories(value: string | undefined): string[] {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /** Parses `--entry-point-addresses`, overriding `entryPoints.addresses`. */
  @Option({
    description: "Comma-separated callable addresses to root stacks at",
    flags: "--entry-point-addresses [entryPointAddresses]",
  })
  public parseEntryPointAddresses(value: string | undefined): string[] {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /** Parses `--entry-point-decorators`, overriding `entryPoints.decorators`. */
  @Option({
    description: "Comma-separated decorators whose methods a framework invokes",
    flags: "--entry-point-decorators [entryPointDecorators]",
  })
  public parseEntryPointDecorators(value: string | undefined): string[] {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /** Parses `--exclude`, overriding `exclude`. */
  @Option({
    description: "Comma-separated globs to leave untraced",
    flags: "--exclude [exclude]",
  })
  public parseExclude(value: string | undefined): string[] {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /** Parses `--exclude-callees`, overriding `excludeCallees`. */
  @Option({
    description: "Comma-separated display-name globs to drop calls landing on",
    flags: "--exclude-callees [excludeCallees]",
  })
  public parseExcludeCallees(value: string | undefined): string[] {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /**
   * Parses `--format`, carried through as written: the resolver that knows the formats refuses an unknown one.
   */
  @Option({
    description: "What to print: markdown, mermaid, or json",
    flags: "-f, --format [format]",
  })
  public parseFormat(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /**
   * Parses `--include-exported-functions`, carried through as written like `--format`.
   */
  @Option({
    description: 'Treat every src/index.ts export as a root: "true" or "false"',
    flags: "--include-exported-functions [includeExportedFunctions]",
  })
  public parseIncludeExportedFunctions(
    value: string | undefined,
  ): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /** Parses `--include-orphans`, overriding the entry-point rule. */
  @Option({
    description: 'Promote callables nothing calls: "true" or "false"',
    flags: "--include-orphans [includeOrphans]",
  })
  public parseIncludeOrphans(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /** Parses `--include-tests`, overriding the entry-point rule. */
  @Option({
    description: 'Trace test files too: "true" or "false"',
    flags: "--include-tests [includeTests]",
  })
  public parseIncludeTests(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /**
   * Prints every path above and below each address. Catches refusals caused by
   * user-written files or command lines; anything else propagates.
   */
  public async run(
    _passedParameters: string[],
    options: AddressCommandOptions,
  ): Promise<void> {
    try {
      await this.printDepth(options);
    } catch (error) {
      const headline = readRefusalHeadline(error);

      if (headline === undefined || !(error instanceof Error)) {
        throw error;
      }

      this.reject(headline, { reason: error.message });
    }
  }
}
