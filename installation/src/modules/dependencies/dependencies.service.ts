import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import {
  CLUSTER_ID_VARIABLE,
  CLUSTER_RESOURCE_ADDRESS,
  EXPORT_PREFIX_PATTERN,
  KUBECONFIG_SKIPPED_MESSAGE,
  LINODE_TOKEN_VARIABLE,
  NON_DIGIT_PATTERN,
  POOL_SUFFIX_PATTERN,
  SURROUNDING_QUOTES_PATTERN,
  TERRAFORM_DIRECTORY,
  UV_WORKSPACE_PROJECT_PATH,
  VARIABLE_NAME_PATTERN,
} from "./dependencies.constants";

import type { EnvironmentVariables } from "./dependencies.types";

/**
 * Installs the workspace's dependencies and initializes the infrastructure
 * around them: Node packages, the Nx cache, the Python environment,
 * Terraform, and a kubeconfig for the cluster.
 *
 * Needs `pnpm`, `nx`, `uv`, and `terraform` on `PATH`, which the software step
 * and `scripts/installation.sh` provide.
 */
@Injectable()
export class DependenciesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DependenciesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Imports the cluster into Terraform's state when it does not track it yet. */
  private importCluster(
    clusterId: string,
    options: { cwd: string; environment: NodeJS.ProcessEnv },
  ): void {
    const tracked = this.processRunner.run("terraform", ["state", "list"], {
      ...options,
      capture: true,
    });

    if (tracked.stdout.includes(CLUSTER_RESOURCE_ADDRESS)) {
      return;
    }

    // The cluster id comes from the `.env` file, so it is passed to Terraform
    // and never printed.
    this.reporter.print("📥 Importing the cluster into Terraform state...");
    this.processRunner.runOrThrow(
      "terraform",
      ["import", CLUSTER_RESOURCE_ADDRESS, clusterId],
      options,
    );
  }

  /**
   * Reads a `.env` file the way a shell would `source` it, for the plain
   * `KEY=value` lines these files hold. Quotes around a value are removed;
   * nothing is expanded.
   */
  private readEnvironmentFile(file: string): EnvironmentVariables {
    const variables: EnvironmentVariables = {};

    if (!fs.existsSync(file)) {
      return variables;
    }

    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const separator = line.indexOf("=");
      const name = line
        .slice(0, separator)
        .replace(EXPORT_PREFIX_PATTERN, "")
        .trim();

      if (separator > 0 && VARIABLE_NAME_PATTERN.test(name)) {
        variables[name] = line
          .slice(separator + 1)
          .trim()
          .replace(SURROUNDING_QUOTES_PATTERN, "$2");
      }
    }

    return variables;
  }

  /** Reads the kubeconfig Terraform outputs, which is base64, and decodes it. */
  private readKubeconfig(options: {
    cwd: string;
    environment: NodeJS.ProcessEnv;
  }): Buffer {
    const output = this.processRunner.runOrThrow(
      "terraform",
      ["output", "-raw", "kubeconfig"],
      { ...options, capture: true },
    );
    const decoded = Buffer.from(output.stdout, "base64");

    // `base64 -d` refuses malformed input; `Buffer.from` quietly skips it.
    if (
      decoded.length === 0 ||
      decoded.toString("base64") !== output.stdout.replaceAll(/\s/gu, "")
    ) {
      throw new Error("Terraform's kubeconfig output is not valid base64");
    }

    return decoded;
  }

  /**
   * Resets the Nx cache, unless this is running inside an Nx task.
   *
   * `nx reset` stops the daemon and deletes the workspace data of the very
   * Nx process running this, so from `nx run installation:start:*` it would
   * pull the floor out from under itself.
   */
  private resetNxCache(): void {
    if (process.env["NX_TASK_TARGET_PROJECT"] !== undefined) {
      this.reporter.print(
        "⚠️  Skipping Nx cache reset inside an Nx task. Run `nx reset` yourself.",
      );

      return;
    }

    this.reporter.print("🔄 Resetting Nx cache...");
    this.processRunner.runOrThrow("nx", ["reset"]);
    this.reporter.print("✅ Nx cache reset");
  }

  /** Reduces a cluster id that may carry a node pool suffix to its digits. */
  private toClusterId(value: string): string {
    return value
      .replace(POOL_SUFFIX_PATTERN, "")
      .replace(NON_DIGIT_PATTERN, "");
  }

  /** Writes `~/.kube/config` from the cluster Terraform manages, when there is none. */
  private writeKubeconfig(workspaceRoot: string): void {
    this.reporter.print("🔑 Setting up kubeconfig...");

    const terraformDirectory = path.join(workspaceRoot, TERRAFORM_DIRECTORY);
    const variables = this.readEnvironmentFile(
      path.join(workspaceRoot, ".env"),
    );
    const environment: NodeJS.ProcessEnv = { ...process.env, ...variables };
    const clusterValue = environment[CLUSTER_ID_VARIABLE] ?? "";
    const kubeconfig = path.join(os.homedir(), ".kube", "config");

    if (
      (environment[LINODE_TOKEN_VARIABLE] ?? "") === "" ||
      clusterValue === ""
    ) {
      this.reporter.print(KUBECONFIG_SKIPPED_MESSAGE);
    } else if (fs.existsSync(kubeconfig)) {
      this.reporter.print("👍 kubeconfig already exists at ~/.kube/config");
    } else {
      const options = { cwd: terraformDirectory, environment };

      this.importCluster(this.toClusterId(clusterValue), options);
      const decoded = this.readKubeconfig(options);

      fs.mkdirSync(path.dirname(kubeconfig), { recursive: true });
      fs.writeFileSync(kubeconfig, decoded);
      this.reporter.print("✅ kubeconfig saved to ~/.kube/config");
    }
  }

  // 🌎 Public Methods

  /** Installs every dependency and initializes Terraform and kubeconfig. */
  public installDependencies(): void {
    const workspaceRoot = process.cwd();

    this.reporter.print("📦 Installing Node dependencies...");
    this.processRunner.runOrThrow("pnpm", ["install"]);
    this.reporter.print("✅ Node dependencies installed");

    // Nx caches task outputs keyed by input hashes. Resetting on first setup
    // keeps stale cache hits from leaking across developer machines.
    this.resetNxCache();

    this.reporter.print("🐍 Setting up Python virtual environment...");
    this.processRunner.runOrThrow("uv", [
      "sync",
      "--project",
      UV_WORKSPACE_PROJECT_PATH,
    ]);
    this.reporter.print("✅ Python dependencies installed (.venv)");

    this.reporter.print("🏗  Initializing Terraform...");
    this.processRunner.runOrThrow("terraform", ["init"], {
      cwd: path.join(workspaceRoot, TERRAFORM_DIRECTORY),
    });
    this.reporter.print("✅ Terraform initialized");

    this.writeKubeconfig(workspaceRoot);
  }
}
