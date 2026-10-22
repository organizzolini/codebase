import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { BestEffortLedgerService } from "../best-effort-ledger/best-effort-ledger.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { BestEffortSnapshotService } from "./best-effort-snapshot.service";
import {
  LABEL_UNSET_MESSAGE,
  RUN_UNSET_MESSAGE,
  SCRIPT_OPTIONS,
  TAIL_CHARACTERS,
  TAIL_LINES,
  unrestoredMessage,
} from "./best-effort.constants";

import type { Environment } from "../../integration.types";
import type { CapturedProcess } from "../process-runner/process-runner.types";
import type {
  BestEffortInputs,
  BestEffortMisconfigured,
  BestEffortOutcome,
  BestEffortSnapshot,
} from "./best-effort.types";

/**
 * Runs one step of a job that must not fail because the step did.
 *
 * The step's script runs under `bash -e -o pipefail`. When it fails, its files
 * go back as they were before it ran, an optional recovery script puts the
 * environment right, and the failure goes in the ledger for the pull request to
 * report. A failure that cannot be undone is the one outcome that stops the
 * run: carrying on would commit a half-applied change.
 */
@Injectable()
export class BestEffortService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly ledger: BestEffortLedgerService,
    private readonly processRunner: ProcessRunnerService,
    private readonly snapshots: BestEffortSnapshotService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Everything a finished process printed, for the log. */
  private printed(result: CapturedProcess): string {
    return `${result.stdout}${result.stderr}`;
  }

  /** Reads and checks what the environment asked for. */
  private readInputs(): BestEffortInputs | BestEffortMisconfigured {
    const label = this.configService.get("BEST_EFFORT_LABEL", { infer: true });
    const run = this.configService.get("BEST_EFFORT_RUN", { infer: true });
    const recover = this.configService.get("BEST_EFFORT_RECOVER", {
      infer: true,
    });
    const paths = (
      this.configService.get("BEST_EFFORT_PATHS", { infer: true }) ?? ""
    )
      .split(/\s+/u)
      .filter((file) => file !== "");

    if (label === undefined || label === "") {
      return { kind: "misconfigured", message: LABEL_UNSET_MESSAGE };
    }

    if (run === undefined || run === "") {
      return { kind: "misconfigured", message: RUN_UNSET_MESSAGE };
    }

    return {
      kind: "inputs",
      label,
      paths,
      run,
      ...(recover === undefined || recover === "" ? {} : { recover }),
    };
  }

  /**
   * Ends a failed step: undoes it, then records it for the pull request. A
   * failure that cannot be undone is not recorded, because the run stops.
   */
  private skip(
    inputs: BestEffortInputs,
    snapshot: BestEffortSnapshot,
    result: CapturedProcess,
  ): BestEffortOutcome {
    const output = this.printed(result);
    const problem = this.undo(snapshot, inputs.recover);

    if (problem !== undefined) {
      return {
        kind: "unrestored",
        message: unrestoredMessage(inputs.label, problem),
        output,
      };
    }

    const failure = {
      exitCode: result.status,
      label: inputs.label,
      tail: this.tail(result),
    };

    this.ledger.append(failure);

    return { failure, kind: "skipped", output };
  }

  /** The end of what a failed step printed, which names why it failed. */
  private tail(result: CapturedProcess): string {
    const text = result.stderr.trim() === "" ? result.stdout : result.stderr;

    return text
      .trim()
      .split("\n")
      .slice(-TAIL_LINES)
      .join("\n")
      .slice(-TAIL_CHARACTERS);
  }

  /**
   * Undoes a failed step: its files, then whatever its recovery script puts
   * right. Returns why that was impossible, or nothing when it was done.
   */
  private undo(
    snapshot: BestEffortSnapshot,
    recover: string | undefined,
  ): string | undefined {
    try {
      this.snapshots.restore(snapshot);
    } catch (error: unknown) {
      return String(error);
    }

    if (recover === undefined) {
      return undefined;
    }

    const recovery = this.processRunner.capture("bash", [
      ...SCRIPT_OPTIONS,
      recover,
    ]);

    return recovery.status === 0
      ? undefined
      : `recovery exited ${String(recovery.status)}: ${this.tail(recovery)}`;
  }

  // 🌎 Public Methods

  /** Runs the step the environment describes and reports how it ended. */
  public attempt(): BestEffortOutcome {
    const inputs = this.readInputs();

    if (inputs.kind === "misconfigured") {
      return inputs;
    }

    const snapshot = this.snapshots.take(inputs.paths);
    const result = this.processRunner.capture("bash", [
      ...SCRIPT_OPTIONS,
      inputs.run,
    ]);

    if (result.status !== 0) {
      return this.skip(inputs, snapshot, result);
    }

    this.snapshots.discard(snapshot);

    return { kind: "succeeded", output: this.printed(result) };
  }
}
