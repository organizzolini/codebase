import { Readable } from "node:stream";
import { buffer } from "node:stream/consumers";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AwsClient } from "aws4fetch";

import { LoggerService } from "@codebase/observability";

import {
  REMOTE_ACCESS_KEY_ID_KEY,
  REMOTE_BUCKET_KEY,
  REMOTE_ENDPOINT_KEY,
  REMOTE_PREFIX,
  REMOTE_REGION_KEY,
  REMOTE_SECRET_ACCESS_KEY_KEY,
  REMOTE_TIMEOUT_MILLISECONDS,
  REMOTE_WRITABLE_KEY,
} from "./shared-nx-cache.constants";

import type { RemoteEntry } from "./shared-nx-cache.types";

/**
 * The S3-compatible bucket behind the local cache, when one is configured.
 *
 * Reads fall through to it. Writes happen only when `NX_SHARED_CACHE_REMOTE_WRITABLE` is `true`,
 * and never over an existing object. The bucket key's permissions, not this process, keep pull requests out.
 */
@Injectable()
export class SharedNxCacheRemoteService {
  // 🏗 Dependency Injection

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SharedNxCacheRemoteService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Sends one signed request, with a time limit. */
  private async send(
    target: { client: AwsClient; url: string },
    method: "GET" | "HEAD" | "PUT",
    body?: Buffer,
  ): Promise<Response> {
    const signal = AbortSignal.timeout(REMOTE_TIMEOUT_MILLISECONDS);

    return target.client.fetch(
      target.url,
      body === undefined ? { method, signal } : { body, method, signal },
    );
  }

  /** A signing client and the url of the object for `hash`, or undefined without a bucket. */
  private target(hash: string): undefined | { client: AwsClient; url: string } {
    const endpoint = this.config.get<string>(REMOTE_ENDPOINT_KEY);
    const bucket = this.config.get<string>(REMOTE_BUCKET_KEY);
    const region = this.config.get<string>(REMOTE_REGION_KEY);
    const accessKeyId = this.config.get<string>(REMOTE_ACCESS_KEY_ID_KEY);
    const secretAccessKey = this.config.get<string>(
      REMOTE_SECRET_ACCESS_KEY_KEY,
    );

    if (!endpoint || !bucket || !region || !accessKeyId || !secretAccessKey) {
      return undefined;
    }

    return {
      client: new AwsClient({
        accessKeyId,
        region,
        secretAccessKey,
        service: "s3",
      }),
      url: `${endpoint}/${bucket}/${REMOTE_PREFIX}/${hash}`,
    };
  }

  // 🌎 Public Methods

  /** Whether a bucket is configured. */
  public enabled(): boolean {
    return this.target("probe") !== undefined;
  }

  /** The object for `hash`, or undefined when absent, unconfigured, or unreachable. */
  public async fetch(hash: string): Promise<RemoteEntry | undefined> {
    const target = this.target(hash);

    if (target === undefined) {
      return undefined;
    }

    try {
      const response = await this.send(target, "GET");

      if (!response.ok) {
        await response.body?.cancel();

        return undefined;
      }

      const bytes = Buffer.from(await response.arrayBuffer());

      return { body: Readable.from([bytes]), length: bytes.length };
    } catch (error) {
      this.logger.warn("🗄️ Failed reading the remote cache", String(error));

      return undefined;
    }
  }

  /** Uploads `body` under `hash` unless read-only or already there; failures are logged, not thrown. */
  public async store(hash: string, body: Readable): Promise<void> {
    const target = this.target(hash);

    if (target === undefined || !this.writable()) {
      body.resume();

      return;
    }

    try {
      const existing = await this.send(target, "HEAD");

      if (existing.ok) {
        body.resume();

        return;
      }

      const upload = await this.send(target, "PUT", await buffer(body));

      if (!upload.ok) {
        this.logger.warn(
          "🗄️ Rejected an upload to the remote cache",
          String(upload.status),
        );
      }
    } catch (error) {
      body.resume();
      this.logger.warn("🗄️ Failed writing the remote cache", String(error));
    }
  }

  /** Whether uploads are switched on, and a bucket is there to take them. */
  public writable(): boolean {
    return (
      this.enabled() && this.config.get<string>(REMOTE_WRITABLE_KEY) === "true"
    );
  }
}
