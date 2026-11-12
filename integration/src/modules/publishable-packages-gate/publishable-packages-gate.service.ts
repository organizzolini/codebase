import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  GATED_PROJECTS,
  NONE_AFFECTED,
  REVISIONS_UNSET_MESSAGE,
} from "./publishable-packages-gate.constants";

import type { Environment } from "../../integration.types";
import type { PublishablePackagesGateOutcome } from "./publishable-packages-gate.types";

/**
 * Decides whether `validation:verify-publishable-packages` runs, and runs it.
 *
 * `nx affected` cannot decide: `validation` owns the target and no ic-suite
 * package is its dependency, so changes never mark it affected.
 *
 * The check installs every publishable package, so it runs whole, never per
 * project.
 */
@Injectable()
export class PublishablePackagesGateService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Asks Nx which gated projects the change between `NX_BASE` and `NX_HEAD`
   * affects.
   *
   * @returns Whether to run the check, skip it, or neither, and why.
   */
  public decide(): PublishablePackagesGateOutcome {
    const base = this.configService.get("NX_BASE", { infer: true });
    const head = this.configService.get("NX_HEAD", { infer: true });

    if (
      base === undefined ||
      base === "" ||
      head === undefined ||
      head === ""
    ) {
      return { exitCode: 1, kind: "failure", message: REVISIONS_UNSET_MESSAGE };
    }

    const shown = this.processRunner.capture("pnpm", [
      "exec",
      "nx",
      "show",
      "projects",
      "--affected",
      "--json",
      `--base=${base}`,
      `--head=${head}`,
      `--projects=${GATED_PROJECTS}`,
    ]);

    if (shown.status !== 0) {
      return {
        exitCode: shown.status,
        kind: "failure",
        message: shown.stderr.trim(),
      };
    }

    const affected = shown.stdout.trim();

    return affected === NONE_AFFECTED
      ? { kind: "skip" }
      : { affected, kind: "run" };
  }

  /**
   * Runs the whole check, with this process's output streams.
   *
   * @returns The check's exit code.
   */
  public execute(): number {
    return this.processRunner.stream("pnpm", [
      "exec",
      "nx",
      "run",
      "validation:verify-publishable-packages",
    ]);
  }
}
