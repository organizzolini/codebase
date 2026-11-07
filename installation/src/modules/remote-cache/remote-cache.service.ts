import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import {
  alreadyConfiguredMessage,
  keyCreatedMessage,
  keyFailedMessage,
  keyResponseSchema,
  LINODE_CLI,
  LINODE_CLI_MISSING_MESSAGE,
  NOT_A_KEY_MESSAGE,
  REMOTE_CACHE_BUCKET,
  REMOTE_CACHE_BUCKET_REGION,
  REMOTE_CACHE_ENDPOINT,
  REMOTE_CACHE_ENVIRONMENT_FILE,
  REMOTE_CACHE_ENVIRONMENT_FILE_VARIABLE,
  REMOTE_CACHE_SIGNING_REGION,
} from "./remote-cache.constants";

/**
 * Gives this machine a key that can only read the shared Nx cache bucket, and
 * keeps it where the session hook looks for it.
 *
 * The key is made with `linode-cli`, because the CI secrets cannot be read back,
 * and goes in a file only its owner can read. A machine that already has the
 * file is left alone. Nothing here ever fails setup: without `linode-cli`, or
 * when it refuses, the machine only goes without the remote tier.
 */
@Injectable()
export class RemoteCacheService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(RemoteCacheService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Asks `linode-cli` for a key that can only read the bucket; says why when it cannot. */
  private createKey(): undefined | { access_key: string; secret_key: string } {
    const result = this.processRunner.run(
      LINODE_CLI,
      [
        "object-storage",
        "keys-create",
        "--label",
        this.keyLabel(),
        "--bucket_access.bucket_name",
        REMOTE_CACHE_BUCKET,
        "--bucket_access.region",
        REMOTE_CACHE_BUCKET_REGION,
        "--bucket_access.permissions",
        "read_only",
        "--json",
      ],
      { capture: true },
    );

    if (result.status !== 0) {
      this.reporter.print(keyFailedMessage(result.output));

      return undefined;
    }

    const keys = keyResponseSchema.safeParse(this.parse(result.stdout));

    if (!keys.success) {
      this.reporter.print(NOT_A_KEY_MESSAGE);

      return undefined;
    }

    return keys.data[0];
  }

  /** The file the key is kept in. */
  private environmentFile(): string {
    return (
      process.env[REMOTE_CACHE_ENVIRONMENT_FILE_VARIABLE] ??
      path.join(os.homedir(), REMOTE_CACHE_ENVIRONMENT_FILE)
    );
  }

  /** The label of this machine's key: its host name, kept to what Linode accepts. */
  private keyLabel(): string {
    const host = os
      .hostname()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .slice(0, 30);

    return `${host}-nx-cache-read-only`;
  }

  /** Reads JSON text, or nothing when it is not JSON. */
  private parse(text: string): unknown {
    try {
      const value: unknown = JSON.parse(text);

      return value;
    } catch {
      return undefined;
    }
  }

  /** Writes the settings the server reads, readable by their owner only. */
  private writeEnvironmentFile(
    file: string,
    key: { access_key: string; secret_key: string },
  ): void {
    fs.mkdirSync(path.dirname(file), { mode: 0o700, recursive: true });
    fs.writeFileSync(
      file,
      [
        `NX_SHARED_CACHE_REMOTE_ENDPOINT=${REMOTE_CACHE_ENDPOINT}`,
        `NX_SHARED_CACHE_REMOTE_BUCKET=${REMOTE_CACHE_BUCKET}`,
        `NX_SHARED_CACHE_REMOTE_REGION=${REMOTE_CACHE_SIGNING_REGION}`,
        `NX_SHARED_CACHE_REMOTE_ACCESS_KEY_ID=${key.access_key}`,
        `NX_SHARED_CACHE_REMOTE_SECRET_ACCESS_KEY=${key.secret_key}`,
        "",
      ].join("\n"),
      { mode: 0o600 },
    );
  }

  // 🌎 Public Methods

  /** Creates the read-only key and its file, unless this machine has them or cannot make them. */
  public setUpRemoteCache(): void {
    const file = this.environmentFile();

    if (fs.existsSync(file)) {
      this.reporter.print(alreadyConfiguredMessage(file));

      return;
    }

    if (this.processRunner.locate(LINODE_CLI) === undefined) {
      this.reporter.print(LINODE_CLI_MISSING_MESSAGE);

      return;
    }

    const key = this.createKey();

    if (key !== undefined) {
      this.writeEnvironmentFile(file, key);
      this.reporter.print(keyCreatedMessage(file));
    }
  }
}
