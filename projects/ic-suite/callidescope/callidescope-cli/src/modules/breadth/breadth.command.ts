import { ConfigurationService } from "@callidescope/configuration";
import { BreadthService } from "@callidescope/graph";
import { AddressReportService } from "@callidescope/output";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { REJECTED_ADDRESS } from "../address-lookup/address-lookup.constants";
import { AddressLookupService } from "../address-lookup/address-lookup.service";
import { readRefusalHeadline } from "../callidescope/callidescope.constants";

import type { LocatedWorkspace } from "../address-lookup/address-lookup.types";
import type { AddressCommandOptions } from "@callidescope/configuration";
import type { BreadthReport } from "@callidescope/output";
import type { LogData } from "@codebase/observability";

/**
 * CLI entry point that prints one callable's direct callers and callees.
 */
@Command({
  description:
    "Print the direct callers and callees of one or more callables, each addressed as <file>#<qualified-name>",
  name: "breadth",
})
@Injectable()
export class BreadthCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly addressLookupService: AddressLookupService,
    private readonly addressReportService: AddressReportService,
    private readonly breadthService: BreadthService,
    private readonly configurationService: ConfigurationService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(BreadthCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Matches every address, or fails the run naming each one that did not match.
   * All or nothing, so no partial report is printed.
   */
  private buildReports(args: {
    addresses: readonly string[];
    workspace: LocatedWorkspace;
  }): BreadthReport[] | undefined {
    const reports: BreadthReport[] = [];
    const problems: string[] = [];

    for (const address of args.addresses) {
      const described = this.describeAddress({
        address,
        workspace: args.workspace,
      });

      if (typeof described === "string") {
        problems.push(described);
        continue;
      }

      reports.push(described);
    }

    if (problems.length > 0) {
      this.reject(REJECTED_ADDRESS, { problems });
      return undefined;
    }

    return reports;
  }

  /**
   * Resolves an address to its callable and direct calls, or returns the reason it cannot.
   */
  private describeAddress(args: {
    address: string;
    workspace: LocatedWorkspace;
  }): BreadthReport | string {
    const resolution = this.addressLookupService.resolve(args);
    const problem = this.addressLookupService.describeProblem({
      address: args.address,
      resolution,
    });

    if (problem !== undefined || resolution.kind !== "resolved") {
      return problem ?? `"${args.address}" resolved to nothing.`;
    }

    const { id } = resolution;
    const { located } = args.workspace;
    const callable = located.callablesById.get(id);

    if (callable === undefined) {
      return `"${args.address}" resolved to a callable that was not traced.`;
    }

    return {
      address: args.address,
      directCalls: this.breadthService.describeDirectCalls({
        callablesById: located.callablesById,
        graph: located.graph,
        id,
      }),
      displayName: callable.node.displayName,
      id,
      location: callable.node.location,
    };
  }

  /** Resolves the addresses and prints their direct callers and callees. */
  private async printBreadth(options: AddressCommandOptions): Promise<void> {
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
    const reports = this.buildReports({ addresses, workspace });

    if (reports === undefined) {
      return;
    }

    process.stdout.write(
      this.addressReportService.renderBreadthReports({
        format: workspace.format,
        reports,
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
        'At least one callable address, as in "breadth --addresses src/foo.service.ts#FooService.bar"',
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
   * Prints each callable's direct callers and callees. Catches refusals caused by
   * user-written files or command lines; anything else propagates.
   */
  public async run(
    _passedParameters: string[],
    options: AddressCommandOptions,
  ): Promise<void> {
    try {
      await this.printBreadth(options);
    } catch (error) {
      const headline = readRefusalHeadline(error);

      if (headline === undefined || !(error instanceof Error)) {
        throw error;
      }

      this.reject(headline, { reason: error.message });
    }
  }
}
