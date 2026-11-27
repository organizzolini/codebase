import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../../../process-runner/process-runner.service";
import { ReporterService } from "../../../reporter/reporter.service";

import type { HelmPlugin } from "../../software.types";

/**
 * Installs a Helm plugin from a pinned release tarball, for Linux machines.
 *
 * The tarball must match its pinned sha256, and the plugin's install hook is
 * dropped since it would download the tarball again.
 */
@Injectable()
export class SoftwareHelmPluginsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareHelmPluginsService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Removes `platformHooks:` and everything after it from the manifest. */
  private dropInstallHook(manifest: string): void {
    const lines = fs.readFileSync(manifest, "utf8").split("\n");
    const hook = lines.findIndex((line) => line.startsWith("platformHooks:"));

    if (hook !== -1) {
      fs.writeFileSync(manifest, `${lines.slice(0, hook).join("\n")}\n`);
    }
  }

  /** Downloads the tarball, fails unless it hashes to the pin, and unpacks it. */
  private fetch(
    plugin: HelmPlugin,
    architecture: string,
    directory: string,
  ): string {
    const tarball = path.join(directory, "plugin.tgz");
    const unpacked = path.join(directory, "plugin");
    const url = plugin.downloadUrl
      .replaceAll("{architecture}", architecture)
      .replaceAll("{version}", plugin.version);

    this.processRunner.runOrThrow("curl", [
      "--proto",
      "=https",
      "--tlsv1.2",
      "-fsSL",
      "-o",
      tarball,
      url,
    ]);

    const actual = this.processRunner
      .runOrThrow("sha256sum", [tarball], { capture: true })
      .stdout.trim()
      .split(/\s+/u)[0];
    const expected = plugin.checksums[process.arch];

    if (actual !== expected) {
      throw new Error(
        `${plugin.name} does not match its pinned checksum: expected ${String(expected)}, got ${String(actual)}`,
      );
    }

    this.processRunner.runOrThrow("mkdir", [unpacked]);
    this.processRunner.runOrThrow("tar", ["-xzf", tarball, "-C", unpacked]);
    this.dropInstallHook(path.join(unpacked, "plugin.yaml"));

    return unpacked;
  }

  /** Whether helm already lists the plugin. */
  private isInstalled(plugin: HelmPlugin): boolean {
    return this.processRunner
      .run("helm", ["plugin", "list"], { capture: true })
      .stdout.split("\n")
      .slice(1)
      .some((line) => line.split(/\s+/u)[0] === plugin.name);
  }

  // 🌎 Public Methods

  /** Installs the plugin unless helm already lists it. */
  public install(plugin: HelmPlugin): void {
    this.reporter.print(`🔍 Checking for the helm ${plugin.name} plugin...`);

    if (this.isInstalled(plugin)) {
      this.reporter.print(
        `👍 The helm ${plugin.name} plugin is already installed`,
      );

      return;
    }

    const architecture = plugin.architectures[process.arch];

    if (
      this.processRunner.platform() !== "linux" ||
      architecture === undefined
    ) {
      throw new Error(
        `The helm ${plugin.name} plugin is installed from its release tarball on Linux amd64 or arm64 only; this is ${this.processRunner.platform()}/${process.arch}.`,
      );
    }

    const directory = this.processRunner
      .runOrThrow("mktemp", ["-d"], { capture: true })
      .stdout.trim();

    this.reporter.print(
      `📦 The helm ${plugin.name} plugin not found. Installing ${plugin.version}...`,
    );

    try {
      const unpacked = this.fetch(plugin, architecture, directory);
      const plugins = path.join(
        this.processRunner
          .runOrThrow("helm", ["env", "HELM_PLUGINS"], { capture: true })
          .stdout.trim(),
        plugin.name,
      );

      this.processRunner.runOrThrow("mkdir", ["-p", plugins]);
      this.processRunner.runOrThrow("cp", ["-R", `${unpacked}/.`, plugins]);
    } finally {
      this.processRunner.run("rm", ["-rf", directory]);
    }

    this.reporter.print(
      `✅ The helm ${plugin.name} plugin ${plugin.version} installed`,
    );
  }
}
