import http from "node:http";
import { Readable } from "node:stream";
import { buffer } from "node:stream/consumers";

import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { SharedNxCacheRemoteService } from "./shared-nx-cache-remote.service";

interface Seen {
  authorization: string | undefined;
  body: string;
  method: string | undefined;
  url: string | undefined;
}

describe(SharedNxCacheRemoteService, () => {
  let service: SharedNxCacheRemoteService;
  let bucket: http.Server | undefined;

  afterEach(async () => {
    await new Promise<void>((resolve) => {
      if (bucket === undefined) {
        resolve();

        return;
      }

      bucket.close(() => {
        resolve();
      });
      bucket.closeAllConnections();
    });
    bucket = undefined;
  });

  /** Stands in for the bucket: records requests and answers from `objects`. */
  const serve = async (
    objects: Map<string, string>,
  ): Promise<{ endpoint: string; seen: Seen[] }> => {
    const seen: Seen[] = [];

    bucket = http.createServer((request, response) => {
      const chunks: Buffer[] = [];

      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        const url = request.url ?? "";
        const body = Buffer.concat(chunks).toString();

        seen.push({
          authorization: request.headers.authorization,
          body,
          method: request.method,
          url,
        });

        if (request.method === "PUT") {
          objects.set(url, body);
          response.writeHead(200).end();
        } else if (objects.has(url)) {
          response.writeHead(200, {
            "Content-Length": Buffer.byteLength(objects.get(url) ?? ""),
          });
          response.end(
            request.method === "HEAD" ? undefined : objects.get(url),
          );
        } else {
          response.writeHead(404).end();
        }
      });
    });
    await new Promise<void>((resolve) => {
      bucket?.listen(0, "127.0.0.1", resolve);
    });

    const address = bucket.address();
    const port =
      typeof address === "object" && address !== null ? address.port : 0;

    return { endpoint: `http://127.0.0.1:${String(port)}`, seen };
  };

  /** Builds the service over a configuration; an absent key reads as unset. */
  const create = async (
    configuration: Record<string, string>,
  ): Promise<SharedNxCacheRemoteService> => {
    const module = await Test.createTestingModule({
      providers: [
        SharedNxCacheRemoteService,
        {
          provide: ConfigService,
          useValue: {
            get: vi
              .fn<ConfigService["get"]>()
              .mockImplementation((key: string) => configuration[key]),
          },
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return module.resolve(SharedNxCacheRemoteService);
  };

  const complete = (
    endpoint: string,
    extra: Record<string, string> = {},
  ): Record<string, string> => ({
    NX_SHARED_CACHE_REMOTE_ACCESS_KEY_ID: "key",
    NX_SHARED_CACHE_REMOTE_BUCKET: "cache",
    NX_SHARED_CACHE_REMOTE_ENDPOINT: endpoint,
    NX_SHARED_CACHE_REMOTE_REGION: "us-iad-18",
    NX_SHARED_CACHE_REMOTE_SECRET_ACCESS_KEY: "secret",
    ...extra,
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SharedNxCacheRemoteService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SharedNxCacheRemoteService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("is disabled until every setting is present", async () => {
    const subject = await create({ NX_SHARED_CACHE_REMOTE_BUCKET: "cache" });

    expect(subject.enabled()).toBe(false);
    expect(subject.writable()).toBe(false);
    await expect(subject.fetch("abc")).resolves.toBeUndefined();
  });

  it("is enabled but read-only unless writing is switched on", async () => {
    const subject = await create(complete("http://127.0.0.1:1"));

    expect(subject.enabled()).toBe(true);
    expect(subject.writable()).toBe(false);
  });

  it("is writable only when told to be", async () => {
    const subject = await create(
      complete("http://127.0.0.1:1", {
        NX_SHARED_CACHE_REMOTE_WRITABLE: "true",
      }),
    );

    expect(subject.writable()).toBe(true);
  });

  it("fetches a signed object by hash from a path-style url", async () => {
    const { endpoint, seen } = await serve(
      new Map([["/cache/nx/abc", "payload"]]),
    );
    const subject = await create(complete(endpoint));

    const entry = await subject.fetch("abc");

    expect(entry?.length).toBe(7);

    const received = await buffer(entry?.body ?? Readable.from([]));

    expect(received.toString()).toBe("payload");
    expect(seen[0]?.url).toBe("/cache/nx/abc");
    expect(seen[0]?.authorization).toMatch(/^AWS4-HMAC-SHA256 /);
  });

  it("reports a missing object as undefined", async () => {
    const { endpoint } = await serve(new Map());
    const subject = await create(complete(endpoint));

    await expect(subject.fetch("missing")).resolves.toBeUndefined();
  });

  it("treats an unreachable bucket as a miss", async () => {
    const subject = await create(complete("http://127.0.0.1:1"));

    await expect(subject.fetch("abc")).resolves.toBeUndefined();
  });

  it("uploads a body when the object does not exist yet", async () => {
    const objects = new Map<string, string>();
    const { endpoint, seen } = await serve(objects);
    const subject = await create(
      complete(endpoint, { NX_SHARED_CACHE_REMOTE_WRITABLE: "true" }),
    );

    await subject.store("abc", Readable.from([Buffer.from("payload")]));

    expect(objects.get("/cache/nx/abc")).toBe("payload");
    expect(seen.map((request) => request.method)).toStrictEqual([
      "HEAD",
      "PUT",
    ]);
  });

  it("never overwrites an existing object", async () => {
    const objects = new Map([["/cache/nx/abc", "first"]]);
    const { endpoint, seen } = await serve(objects);
    const subject = await create(
      complete(endpoint, { NX_SHARED_CACHE_REMOTE_WRITABLE: "true" }),
    );

    await subject.store("abc", Readable.from([Buffer.from("second")]));

    expect(objects.get("/cache/nx/abc")).toBe("first");
    expect(seen.map((request) => request.method)).toStrictEqual(["HEAD"]);
  });

  it("does not upload when read-only", async () => {
    const { endpoint, seen } = await serve(new Map());
    const subject = await create(complete(endpoint));

    await subject.store("abc", Readable.from([Buffer.from("payload")]));

    expect(seen).toStrictEqual([]);
  });

  it("swallows an upload failure so a build never fails on the cache", async () => {
    const subject = await create(
      complete("http://127.0.0.1:1", {
        NX_SHARED_CACHE_REMOTE_WRITABLE: "true",
      }),
    );

    await expect(
      subject.store("abc", Readable.from([Buffer.from("payload")])),
    ).resolves.toBeUndefined();
  });
});
