import crypto from "node:crypto";
import http from "node:http";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { LoggerService } from "@codebase/observability";

import { SharedNxCacheRemoteService } from "./shared-nx-cache-remote.service";
import { SharedNxCacheStorageService } from "./shared-nx-cache-storage.service";
import {
  BEARER_PATTERN,
  BIND_ADDRESS,
  DEFAULT_TOKEN,
  DIGITS_PATTERN,
  EVICTION_INTERVAL_MILLISECONDS,
  HASH_PATTERN,
  ROUTE_PATTERN,
} from "./shared-nx-cache.constants";

import type {
  Exchange,
  RunningServer,
  ServerOptions,
  WriteOutcome,
} from "./shared-nx-cache.types";

/**
 * Serves Nx's self-hosted remote cache API on this machine, so every worktree
 * shares the task outputs any of them produced.
 *
 * - `PUT /v1/cache/{hash}` and `GET /v1/cache/{hash}`, both behind a bearer
 *   token compared in constant time.
 * - Bound to 127.0.0.1 only, and the hash is checked against a pattern that
 *   admits no path separator, so a request cannot leave the cache directory.
 * - A miss is answered from the bucket behind it, when one is configured, and
 *   a stored upload goes to it only when it is writable.
 * - Evicts on startup and then hourly, until it is closed.
 */
@Injectable()
export class SharedNxCacheServerService {
  // 🏗 Dependency Injection

  constructor(
    private readonly storage: SharedNxCacheStorageService,
    private readonly remote: SharedNxCacheRemoteService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SharedNxCacheServerService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether the request carries the right bearer token, compared in constant time. */
  private authorized(request: http.IncomingMessage): boolean {
    const match = BEARER_PATTERN.exec(request.headers.authorization ?? "");

    if (match?.[1] === undefined) {
      return false;
    }

    const digest = (value: string): Buffer =>
      crypto.createHash("sha256").update(value).digest();

    return crypto.timingSafeEqual(
      digest(match[1]),
      digest(this.expectedToken()),
    );
  }

  /** The token Nx sends: the environment's, or the built-in one. */
  private expectedToken(): string {
    const configured = this.config.get<string>(
      "NX_SELF_HOSTED_REMOTE_CACHE_ACCESS_TOKEN",
    );

    return configured !== undefined && configured !== ""
      ? configured
      : DEFAULT_TOKEN;
  }

  /** Sends the blob of a `GET`, marking it as used. */
  private async get(exchange: Exchange, hash: string): Promise<void> {
    const { directory, response } = exchange;

    if (
      !(await this.storage.exists(directory, hash)) &&
      !(await this.pull(directory, hash))
    ) {
      this.reply(response, 404, "The record was not found");

      return;
    }

    await this.storage.touch(directory, hash);
    response.writeHead(200, { "Content-Type": "application/octet-stream" });
    this.storage.read(directory, hash).pipe(response);
  }

  /** Routes one request. */
  private async handle(exchange: Exchange): Promise<void> {
    const hash = this.validate(exchange);

    if (hash === undefined) {
      exchange.request.resume();
    } else if (exchange.request.method === "PUT") {
      await this.put(exchange, hash);
    } else if (exchange.request.method === "GET") {
      await this.get(exchange, hash);
    } else {
      exchange.request.resume();
      this.reply(exchange.response, 405, "Method not allowed");
    }
  }

  /** Copies an entry the bucket holds into the local directory; whether it is there now. */
  private async pull(directory: string, hash: string): Promise<boolean> {
    const entry = await this.remote.fetch(hash);

    if (entry === undefined) {
      return false;
    }

    const outcome = await this.storage.write({
      body: entry.body,
      directory,
      hash,
      length: entry.length,
    });

    return outcome !== "length-mismatch";
  }

  /** Stores the body of a `PUT`. */
  private async put(exchange: Exchange, hash: string): Promise<void> {
    const { directory, request, response } = exchange;
    const declared = request.headers["content-length"] ?? "";

    if (!DIGITS_PATTERN.test(declared)) {
      request.resume();
      this.reply(response, 400, "A Content-Length header is required");

      return;
    }

    if (await this.storage.exists(directory, hash)) {
      request.resume();
      this.reply(response, 409, "Cannot override an existing record");

      return;
    }

    const outcome = await this.storage.write({
      body: request,
      directory,
      hash,
      length: Number(declared),
    });

    await this.settle(exchange, hash, outcome);
  }

  /** Answers with a plain text message. */
  private reply(
    response: http.ServerResponse,
    status: number,
    message: string,
  ): void {
    response.writeHead(status, { "Content-Type": "text/plain" });
    response.end(message);
  }

  /** Copies a stored upload to a writable bucket, then answers for its outcome. */
  private async settle(
    exchange: Exchange,
    hash: string,
    outcome: WriteOutcome,
  ): Promise<void> {
    const { directory, response } = exchange;

    if (outcome === "created") {
      if (this.remote.writable()) {
        await this.remote.store(hash, this.storage.read(directory, hash));
      }

      this.reply(response, 200, "Successfully uploaded the output");
    } else if (outcome === "exists") {
      this.reply(response, 409, "Cannot override an existing record");
    } else {
      this.reply(response, 400, "The body does not match Content-Length");
    }
  }

  /** Answers 404, 401, or 400 to a request that cannot be served; otherwise returns its hash. */
  private validate(exchange: Exchange): string | undefined {
    const { request, response } = exchange;
    const route = ROUTE_PATTERN.exec((request.url ?? "").split("?")[0] ?? "");
    const hash = route?.[1];

    if (hash === undefined) {
      this.reply(response, 404, "Not found");
    } else if (!this.authorized(request)) {
      this.reply(response, 401, "Missing or invalid access token");
    } else if (HASH_PATTERN.test(hash)) {
      return hash;
    } else {
      this.reply(response, 400, "Invalid hash");
    }

    return undefined;
  }

  // 🌎 Public Methods

  /** Listens on 127.0.0.1, evicts now, and evicts hourly until `close` is called. */
  public async start(options: ServerOptions): Promise<RunningServer> {
    const { directory } = options;
    const evict = (): void => {
      this.storage.evict(directory).catch((error: unknown) => {
        this.logger.error("🗄️ Failed evicting the cache", String(error));
      });
    };
    const server = http.createServer((request, response) => {
      this.handle({ directory, request, response }).catch((error: unknown) => {
        this.logger.error("🗄️ Failed serving a request", String(error));

        if (!response.headersSent) {
          this.reply(response, 500, "Internal error");
        }
      });
    });

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(options.port, BIND_ADDRESS, resolve);
    });
    evict();

    const timer = setInterval(evict, EVICTION_INTERVAL_MILLISECONDS);
    const address = server.address();

    return {
      close: async (): Promise<void> => {
        clearInterval(timer);
        await new Promise<void>((resolve) => {
          server.close(() => {
            resolve();
          });
          server.closeAllConnections();
        });
      },
      port: typeof address === "object" && address !== null ? address.port : 0,
    };
  }
}
