import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  DEFAULT_SPELLING_PATHS,
  DEFAULT_TEMPLATE_PATHS,
  INCLUDE_SPELLING_VALUE,
  INCLUDE_TEMPLATES_VALUE,
  REVISIONS_UNSET_MESSAGE,
  TARGET_UNSET_MESSAGE,
  TEMPLATE_SELECTOR,
} from "./run-affected.constants";

import type { Environment } from "../../integration.types";
import type {
  RunAffectedCorrections,
  RunAffectedFailure,
  RunAffectedInputs,
  RunAffectedOutcome,
  RunAffectedPlan,
} from "./run-affected.types";

/**
 * Runs one Nx target on the projects a CI change affects, after correcting the
 * changed-file list Nx selects them from.
 *
 * Two kinds of file mislead Nx. Spelling files over-select: Nx decides affected
 * per project, so one new dictionary word selected every project; they are
 * dropped unless `INCLUDE_SPELLING`. Conformetry templates under-select:
 * `.nxignore` hides some from Nx, so with `INCLUDE_TEMPLATES` a changed
 * template adds the conformetry config, an input of every instance project.
 *
 * With nothing to correct, Nx gets `--base`/`--head`; otherwise `--stdin`.
 * `--stdin` is the fallback because Nx counts every file it is handed as
 * changed in full, so a lockfile touches every project. Only `--base`/`--head`
 * diff `package.json` and the lockfile field by field. The list is built the
 * way Nx builds its own, from the merge base of the two revisions, falling back
 * to `NX_BASE`. An empty list affects nothing; it never falls back to
 * everything.
 */
@Injectable()
export class RunAffectedService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Builds the run that hands Nx the corrected change set over `--stdin`. */
  private correctedPlan(
    inputs: RunAffectedInputs,
    corrections: RunAffectedCorrections,
  ): RunAffectedPlan {
    const { extra, target } = inputs;
    const { changed, spellingFiles, templateFiles } = corrections;
    const kept = changed.filter((file) => !spellingFiles.includes(file));
    const corrected =
      templateFiles.length > 0 ? [...kept, TEMPLATE_SELECTOR] : kept;

    return {
      arguments: [
        "exec",
        "nx",
        "affected",
        "--stdin",
        `--target=${target}`,
        ...extra,
      ],
      input: `${corrected.join("\n")}\n`,
      kind: "run",
      spellingFiles,
      target,
      templateFiles,
    };
  }

  /**
   * Picks out the files that mislead Nx for this target, listing the change
   * set only when the target asks for a correction.
   */
  private findCorrections(
    inputs: RunAffectedInputs,
  ): RunAffectedCorrections | RunAffectedFailure {
    const dropSpelling =
      this.configService.get("INCLUDE_SPELLING", { infer: true }) !==
      INCLUDE_SPELLING_VALUE;
    const addTemplates =
      this.configService.get("INCLUDE_TEMPLATES", { infer: true }) ===
      INCLUDE_TEMPLATES_VALUE;

    if (!dropSpelling && !addTemplates) {
      return {
        changed: [],
        kind: "corrections",
        spellingFiles: [],
        templateFiles: [],
      };
    }

    const changed = this.listChangedFiles(inputs.base, inputs.head);

    if (!Array.isArray(changed)) {
      return changed;
    }

    const spelling = this.pattern("SPELLING_PATHS", DEFAULT_SPELLING_PATHS);
    const templates = this.pattern("TEMPLATE_PATHS", DEFAULT_TEMPLATE_PATHS);

    return {
      changed,
      kind: "corrections",
      spellingFiles: dropSpelling
        ? changed.filter((file) => spelling.test(file))
        : [],
      templateFiles: addTemplates
        ? changed.filter((file) => templates.test(file))
        : [],
    };
  }

  /** Lists the files changed between two revisions, or why that failed. */
  private listChangedFiles(
    base: string,
    head: string,
  ): RunAffectedFailure | string[] {
    const mergeBase = this.processRunner.capture("git", [
      "merge-base",
      base,
      head,
    ]);
    const from = mergeBase.status === 0 ? mergeBase.stdout.trim() : base;
    const diff = this.processRunner.capture("git", [
      "diff",
      "--name-only",
      "--no-renames",
      "--relative",
      from,
      head,
    ]);

    if (diff.status !== 0) {
      return {
        exitCode: diff.status,
        kind: "failure",
        message: diff.stderr.trim(),
      };
    }

    return diff.stdout.split("\n").filter((line) => line !== "");
  }

  /** Builds the pattern a variable names, or its default when unset. */
  private pattern(
    variable: "SPELLING_PATHS" | "TEMPLATE_PATHS",
    fallback: string,
  ): RegExp {
    const configured = this.configService.get(variable, { infer: true });

    return new RegExp(
      configured === undefined || configured === "" ? fallback : configured,
    );
  }

  /** Reads the target, the revisions, and the extra flags, or what is unset. */
  private readInputs(): RunAffectedFailure | RunAffectedInputs {
    const target = this.configService.get("TARGET", { infer: true });
    const base = this.configService.get("NX_BASE", { infer: true });
    const head = this.configService.get("NX_HEAD", { infer: true });

    if (target === undefined || target === "") {
      return { exitCode: 1, kind: "failure", message: TARGET_UNSET_MESSAGE };
    }

    if (
      base === undefined ||
      base === "" ||
      head === undefined ||
      head === ""
    ) {
      return { exitCode: 1, kind: "failure", message: REVISIONS_UNSET_MESSAGE };
    }

    const extra = (this.configService.get("ARGUMENTS", { infer: true }) ?? "")
      .split(/\s+/)
      .filter((argument) => argument !== "");

    return { base, extra, head, kind: "inputs", target };
  }

  /** Builds the run that hands Nx the revisions and lets it diff them. */
  private revisionsPlan(inputs: RunAffectedInputs): RunAffectedPlan {
    const { base, extra, head, target } = inputs;

    return {
      arguments: [
        "exec",
        "nx",
        "affected",
        `--base=${base}`,
        `--head=${head}`,
        `--target=${target}`,
        ...extra,
      ],
      kind: "run",
      spellingFiles: [],
      target,
      templateFiles: [],
    };
  }

  // 🌎 Public Methods

  /**
   * Runs `nx affected` as planned, with this process's output streams.
   *
   * @param plan - The run `plan` produced.
   * @returns `nx affected`'s exit code.
   */
  public execute(plan: RunAffectedPlan): number {
    return this.processRunner.stream("pnpm", plan.arguments, plan.input);
  }

  /**
   * Works out the `nx affected` run this environment asks for.
   *
   * @returns The run to make, or the reason there is none.
   */
  public plan(): RunAffectedOutcome {
    const inputs = this.readInputs();

    if (inputs.kind === "failure") {
      return inputs;
    }

    const corrections = this.findCorrections(inputs);

    if (corrections.kind === "failure") {
      return corrections;
    }

    return corrections.spellingFiles.length > 0 ||
      corrections.templateFiles.length > 0
      ? this.correctedPlan(inputs, corrections)
      : this.revisionsPlan(inputs);
  }
}
