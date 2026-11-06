import path from "node:path";

import { ConfigurationService } from "@coinagerie/configuration";
import { DeliveryService } from "@coinagerie/output";
import { VocabularyService } from "@coinagerie/vocabulary";
import { Injectable } from "@nestjs/common";

import { REPORT_MARK } from "./check.constants";
import { judgeDifferences, reportWritten } from "./check.utilities";

import type { CheckVerdict, RunCheckArguments } from "./check.types";
import type { ResolvedCoinagerieConfiguration } from "@coinagerie/configuration";

/**
 * Judges or rewrites one project's glossaries, in this process.
 *
 * What the `coinagerie` command does for the working directory it is started
 * in, minus the process: the services are built once and each project is a
 * call. A project that cannot be read, collected, or compared fails with the
 * reason rather than throwing, so one project's fault never takes down the
 * verdicts of the others a batch carries.
 */
@Injectable()
export class CheckService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly vocabularyService: VocabularyService,
    private readonly deliveryService: DeliveryService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Checks or writes every destination against the collected words. */
  private deliver(args: {
    configuration: ResolvedCoinagerieConfiguration;
    mode: RunCheckArguments["mode"];
    words: string[];
    workspaceRoot: string;
  }): CheckVerdict {
    const { configuration, mode, words, workspaceRoot } = args;
    const destinations = configuration.outputs;

    if (destinations.length === 0) {
      return {
        ok: false,
        report: `${REPORT_MARK} Found no glossary destination to ${mode}: ${path.relative(workspaceRoot, configuration.configurationPath ?? "")}`,
      };
    }

    return mode === "write"
      ? reportWritten({
          results: this.deliveryService.write({ destinations, words }),
          workspaceRoot,
        })
      : judgeDifferences({
          differences: this.deliveryService.check({ destinations, words }),
          workspaceRoot,
        });
  }

  // 🌎 Public Methods

  /** Runs one project's check or write, failing with the reason on any fault. */
  public async run(args: RunCheckArguments): Promise<CheckVerdict> {
    try {
      const configuration = await this.configurationService.loadConfiguration({
        configurationPath: undefined,
        overrides: {},
        workingDirectory: args.directory,
      });
      const words = await this.vocabularyService.collect(configuration);

      return this.deliver({
        configuration,
        mode: args.mode,
        words,
        workspaceRoot: args.workspaceRoot,
      });
    } catch (error) {
      return {
        ok: false,
        report: `${REPORT_MARK} Could not ${args.mode} ${path.relative(args.workspaceRoot, args.directory)}: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
