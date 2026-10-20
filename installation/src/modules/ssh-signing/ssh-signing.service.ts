import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import {
  ALLOWED_SIGNERS_FILE_NAME,
  EMPTY_TREE_HASH,
  OPENSSH_PACKAGE,
  PROBE_MESSAGE,
  SSH_DIRECTORY_MODE,
  SSH_DIRECTORY_NAME,
} from "./ssh-signing.constants";
import { formatAllowedSigner, readSshPublicKey } from "./ssh-signing.utilities";

/**
 * Makes SSH commit signatures verifiable on this machine.
 *
 * When git signs with SSH through a signer that keeps its private key out of
 * reach, the commit hooks cannot verify what it signs: they need `ssh-keygen`
 * and an allowed signers file listing the signer's public key. This installs
 * the first and writes the second, reading the key out of a signature the
 * signer just made. A step that cannot finish prints why and leaves the rest
 * alone, because the commit check names whatever is still missing.
 */
@Injectable()
export class SshSigningService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SshSigningService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Installs `ssh-keygen` through apt when it is missing and apt is usable. */
  private installSshKeygen(): void {
    if (this.processRunner.locate("ssh-keygen") !== undefined) {
      return;
    }

    if (
      process.getuid?.() !== 0 ||
      this.processRunner.locate("apt-get") === undefined
    ) {
      this.reporter.print(
        "⚠️  ssh-keygen is missing and cannot be installed here, so SSH signatures cannot be verified.",
      );

      return;
    }

    this.reporter.print(`📦 Installing ${OPENSSH_PACKAGE}...`);

    const updated = this.processRunner.run("apt-get", ["update", "-qq"]);
    const installed = this.processRunner.run("apt-get", [
      "install",
      "-y",
      "-qq",
      "--no-install-recommends",
      OPENSSH_PACKAGE,
    ]);

    if (updated.status !== 0 || installed.status !== 0) {
      this.reporter.print(
        `⚠️  Could not install ${OPENSSH_PACKAGE}, so SSH signatures cannot be verified.`,
      );
    }
  }

  /** Reads one git setting, or an empty string when it is unset. */
  private readGitSetting(name: string): string {
    const result = this.processRunner.run("git", ["config", "--get", name], {
      capture: true,
    });

    return result.status === 0 ? result.stdout.trim() : "";
  }

  /** Signs a throwaway commit and reads the signer's public key out of it. */
  private readSignerKey(): string | undefined {
    const probe = this.processRunner.run(
      "git",
      ["commit-tree", EMPTY_TREE_HASH, "-m", PROBE_MESSAGE, "-S"],
      { capture: true },
    );

    if (probe.status !== 0) {
      return undefined;
    }

    const commit = this.processRunner.run(
      "git",
      ["cat-file", "commit", probe.stdout.trim()],
      { capture: true },
    );

    return commit.status === 0 ? readSshPublicKey(commit.stdout) : undefined;
  }

  /** Lists the key in the allowed signers file once, and returns its path. */
  private writeAllowedSigners(email: string, publicKey: string): string {
    const directory = path.join(os.homedir(), SSH_DIRECTORY_NAME);
    const file = path.join(directory, ALLOWED_SIGNERS_FILE_NAME);

    fs.mkdirSync(directory, { mode: SSH_DIRECTORY_MODE, recursive: true });

    const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";

    if (!existing.includes(publicKey)) {
      const separator = existing === "" || existing.endsWith("\n") ? "" : "\n";

      fs.appendFileSync(
        file,
        `${separator}${formatAllowedSigner(email, publicKey)}`,
      );
    }

    return file;
  }

  // 🌎 Public Methods

  /** Installs `ssh-keygen` and points git at an allowed signers file. */
  public configureSshSigning(): void {
    if (this.readGitSetting("gpg.format") !== "ssh") {
      this.reporter.print(
        "👍 Git does not sign with SSH, so there are no SSH signatures to verify.",
      );

      return;
    }

    this.installSshKeygen();

    const email = this.readGitSetting("user.email");
    const publicKey = this.readSignerKey();

    if (email === "" || publicKey === undefined) {
      this.reporter.print(
        "⚠️  Could not read the SSH signing key and committer email, so signatures cannot be verified.",
      );

      return;
    }

    const file = this.writeAllowedSigners(email, publicKey);

    this.processRunner.runOrThrow("git", [
      "config",
      "--global",
      "gpg.ssh.allowedSignersFile",
      file,
    ]);
    this.reporter.print(`🔏 SSH signatures are verified against ${file}.`);
  }
}
