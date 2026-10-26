import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import type {
  ReleaseArchiveTool,
  ReleaseDownload,
} from "./release-archives.types";

/**
 * Installs a command-line tool from its published release, for machines with
 * no Homebrew.
 *
 * A Claude Code cloud session and the devcontainer run Linux, which has no
 * Homebrew, so the software step that installs these through it never runs
 * there. The archive is checked against the checksum its publisher lists, and
 * the executables land in `~/.local/bin`, which the Linux bootstrap puts on
 * `PATH`.
 */
@Injectable()
export class ReleaseArchivesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ReleaseArchivesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Downloads a URL into a file. */
  private download(url: string, file: string): void {
    this.processRunner.runOrThrow("curl", ["-fsSL", "-o", file, url]);
  }

  /** Downloads a release, checks it against its published checksum, and unpacks it. */
  private fetch(tool: ReleaseArchiveTool, download: ReleaseDownload): void {
    this.download(
      this.resolveTemplate(tool.downloadUrl, tool, download.architecture),
      path.join(download.directory, download.archive),
    );
    this.verify(tool, download);
    this.unpack(tool, download);
  }

  /** Finds the checksum the publisher lists for an archive, whichever way the list is laid out. */
  private findPublishedChecksum(listing: string, archiveName: string): string {
    for (const line of listing.split("\n")) {
      const [hash, name] = line.trim().split(/\s+/u);

      if (
        hash !== undefined &&
        hash !== "" &&
        (name === undefined || name.replace(/^\*/u, "") === archiveName)
      ) {
        return hash.toLowerCase();
      }
    }

    throw new Error(`No checksum is published for ${archiveName}`);
  }

  /** Installs each of the release's executables into `~/.local/bin`. */
  private place(tool: ReleaseArchiveTool, download: ReleaseDownload): void {
    const binaryDirectory = path.join(os.homedir(), ".local", "bin");

    this.processRunner.runOrThrow("mkdir", ["-p", binaryDirectory]);

    for (const member of tool.members) {
      const file = this.resolveTemplate(member, tool, download.architecture);

      this.processRunner.runOrThrow("install", [
        "-m",
        "0755",
        path.join(download.directory, file),
        path.join(binaryDirectory, path.basename(file)),
      ]);
    }
  }

  /** The name this tool uses for this machine's processor, or a thrown error when it publishes none. */
  private resolveArchitecture(tool: ReleaseArchiveTool): string {
    const architecture = tool.architectures[process.arch];

    if (
      this.processRunner.platform() !== "linux" ||
      architecture === undefined
    ) {
      throw new Error(
        `${tool.name} is installed from its release archive on Linux only; this is ${this.processRunner.platform()}/${process.arch}. Use Homebrew instead.`,
      );
    }

    return architecture;
  }

  /** Fills a template's `{version}` and `{architecture}`. */
  private resolveTemplate(
    template: string,
    tool: ReleaseArchiveTool,
    architecture: string,
  ): string {
    return template
      .replaceAll("{architecture}", architecture)
      .replaceAll("{version}", tool.version);
  }

  /** Unpacks what was downloaded, when it is packed at all. */
  private unpack(tool: ReleaseArchiveTool, download: ReleaseDownload): void {
    const { archive, directory } = download;

    if (tool.format === "tar.gz") {
      this.processRunner.runOrThrow("tar", ["-xzf", archive], {
        cwd: directory,
      });
    } else if (tool.format === "zip") {
      this.processRunner.runOrThrow("unzip", ["-q", "-o", archive], {
        cwd: directory,
      });
    }
  }

  /** Fails unless the downloaded file hashes to what the publisher lists. */
  private verify(tool: ReleaseArchiveTool, download: ReleaseDownload): void {
    const { architecture, archive, directory } = download;
    const listing = this.processRunner.runOrThrow(
      "curl",
      ["-fsSL", this.resolveTemplate(tool.checksumUrl, tool, architecture)],
      { capture: true },
    ).stdout;
    const expected = this.findPublishedChecksum(listing, archive);
    const actual = this.processRunner
      .runOrThrow("sha256sum", [path.join(directory, archive)], {
        capture: true,
      })
      .stdout.trim()
      .split(/\s+/u)[0]
      ?.toLowerCase();

    if (actual !== expected) {
      throw new Error(
        `${archive} does not match its published checksum: expected ${expected}, got ${String(actual)}`,
      );
    }
  }

  // 🌎 Public Methods

  /** Installs the tool into `~/.local/bin` unless it is already a command. */
  public install(tool: ReleaseArchiveTool): void {
    this.reporter.print(`🔍 Checking for ${tool.name} installation...`);

    if (this.processRunner.locate(tool.name) !== undefined) {
      this.reporter.print(`👍 ${tool.name} is already installed`);

      return;
    }

    const architecture = this.resolveArchitecture(tool);
    const download: ReleaseDownload = {
      architecture,
      archive: this.resolveTemplate(tool.archiveName, tool, architecture),
      directory: this.processRunner
        .runOrThrow("mktemp", ["-d"], { capture: true })
        .stdout.trim(),
    };

    this.reporter.print(
      `📦 ${tool.name} not found. Installing ${tool.version}...`,
    );

    try {
      this.fetch(tool, download);
      this.place(tool, download);
    } finally {
      this.processRunner.run("rm", ["-rf", download.directory]);
    }

    this.reporter.print(`✅ ${tool.name} ${tool.version} installed`);
  }
}
