import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { Readable } from "node:stream";
import { buffer } from "node:stream/consumers";

import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LoggerService } from "@codebase/observability";

import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";

import { SharedNxCacheRemoteService } from "./shared-nx-cache-remote.service";
import { SharedNxCacheServerService } from "./shared-nx-cache-server.service";
import { SharedNxCacheStorageService } from "./shared-nx-cache-storage.service";
import { DEFAULT_TOKEN } from "./shared-nx-cache.constants";

import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";
import type { RunningServer } from "./shared-nx-cache.types";

interface Reply {
  body: Buffer;
  status: number;
}

describe(SharedNxCacheServerService, () => {
  let workspace: TemporaryWorkspace;
  let directory: string;
  let running: RunningServer;
  let base: string;

  /** Calls the live server and reads the whole reply. */
  const call = async (
    method: string,
    hash: string,
    options: { body?: Buffer; headers?: Record<string, string> } = {},
  ): Promise<Reply> => {
    const response = await fetch(`${base}${hash}`, {
      ...(options.body === undefined
        ? {}
        : { body: new Uint8Array(options.body) }),
      headers: {
        Authorization: `Bearer ${DEFAULT_TOKEN}`,
        ...options.headers,
      },
      method,
    });

    return {
      body: Buffer.from(await response.arrayBuffer()),
      status: response.status,
    };
  };

  /** What the cache directory holds, which is nothing before the first upload. */
  const listing = (): string[] =>
    fs.existsSync(directory) ? fs.readdirSync(directory) : [];

  /** Sends bytes over a raw socket, which `fetch` would not let disagree with their length. */
  const raw = async (request: string, close = true): Promise<string> =>
    new Promise((resolve, reject) => {
      const socket = net.connect(running.port, "127.0.0.1", () => {
        socket.write(request);

        if (close) {
          socket.end();
        }
      });
      let reply = "";

      socket.on("data", (chunk: Buffer) => {
        reply += chunk.toString();
      });
      socket.on("close", () => {
        resolve(reply);
      });
      socket.on("error", reject);
    });

  beforeAll(async () => {
    workspace = createTemporaryWorkspace();
    directory = path.join(workspace.root, "cache");

    const module = await Test.createTestingModule({
      providers: [
        SharedNxCacheServerService,
        SharedNxCacheStorageService,
        SharedNxCacheRemoteService,
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const service = await module.resolve(SharedNxCacheServerService);

    running = await service.start({ directory, port: 0 });
    base = `http://127.0.0.1:${String(running.port)}/v1/cache/`;
  });

  afterEach(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  afterAll(async () => {
    await running.close();
    workspace.remove();
  });

  it("listens on an ephemeral loopback port", () => {
    expect.hasAssertions();
    expect(running.port).toBeGreaterThan(0);
  });

  it("stores an upload and serves it back", async () => {
    expect.hasAssertions();

    const body = Buffer.from("a tar archive, more or less");
    const put = await call("PUT", "abc123", { body });
    const get = await call("GET", "abc123");

    expect(put.status).toBe(200);
    expect(get.status).toBe(200);
    expect(get.body.equals(body)).toBe(true);
    expect(listing()).toStrictEqual(["abc123"]);
  });

  it("serves a body of many megabytes intact", async () => {
    expect.hasAssertions();

    const body = Buffer.alloc(8 * 1024 * 1024, "xyz");

    await call("PUT", "big-one", { body });

    const reply = await call("GET", "big-one");

    expect(reply.status).toBe(200);
    expect(reply.body.equals(body)).toBe(true);
  });

  it("refuses to overwrite an existing hash", async () => {
    expect.hasAssertions();

    await call("PUT", "same", { body: Buffer.from("first") });

    const second = await call("PUT", "same", { body: Buffer.from("second") });
    const get = await call("GET", "same");

    expect(second.status).toBe(409);
    expect(get.body.toString()).toBe("first");
  });

  it("answers 404 for a hash that is not stored", async () => {
    expect.hasAssertions();

    const { status } = await call("GET", "absent");

    expect(status).toBe(404);
  });

  it("answers 401 without a token or with the wrong one", async () => {
    expect.hasAssertions();

    const missing = await fetch(`${base}abc`);
    const wrong = await call("GET", "abc", {
      headers: { Authorization: "Bearer nope" },
    });
    const malformed = await call("PUT", "abc", {
      body: Buffer.from("x"),
      headers: { Authorization: DEFAULT_TOKEN },
    });

    expect(missing.status).toBe(401);
    await expect(missing.text()).resolves.toContain("token");
    expect(wrong.status).toBe(401);
    expect(malformed.status).toBe(401);
    expect(fs.existsSync(path.join(directory, "abc"))).toBe(false);
  });

  it.each(["..", "a%2Fb", "%2e%2e%2f", "a.b", "a/b", "x".repeat(129)])(
    "rejects the hash %j without touching the file system",
    async (hash) => {
      expect.hasAssertions();

      const request = (method: string): string =>
        [
          `${method} /v1/cache/${hash} HTTP/1.1`,
          "Host: x",
          `Authorization: Bearer ${DEFAULT_TOKEN}`,
          "Content-Length: 1",
          "Connection: close",
          "",
          "x",
        ].join("\r\n");

      await expect(raw(request("PUT"))).resolves.toMatch(/^HTTP\/1\.1 400/);
      await expect(raw(request("GET"))).resolves.toMatch(/^HTTP\/1\.1 400/);
      expect(listing()).toStrictEqual([]);
    },
  );

  it("answers 400 to an upload with no Content-Length", async () => {
    expect.hasAssertions();

    const reply = await raw(
      [
        "PUT /v1/cache/chunked HTTP/1.1",
        "Host: x",
        `Authorization: Bearer ${DEFAULT_TOKEN}`,
        "Transfer-Encoding: chunked",
        "Connection: close",
        "",
        "5",
        "hello",
        "0",
        "",
        "",
      ].join("\r\n"),
    );

    expect(reply).toMatch(/^HTTP\/1\.1 400/);
    expect(fs.existsSync(path.join(directory, "chunked"))).toBe(false);
  });

  it("answers 400 to a body shorter than its Content-Length", async () => {
    expect.hasAssertions();

    const reply = await raw(
      [
        "PUT /v1/cache/short HTTP/1.1",
        "Host: x",
        `Authorization: Bearer ${DEFAULT_TOKEN}`,
        "Content-Length: 100",
        "Connection: close",
        "",
        "only a little",
      ].join("\r\n"),
    );

    expect(reply).toMatch(/^HTTP\/1\.1 400/);

    // Node answers a connection cut mid-body itself, so the reply can arrive
    // before the upload's own cleanup has run.
    await vi.waitFor(() => {
      expect(listing()).toStrictEqual([]);
    });
  });

  it("answers 404 for other paths and 405 for other methods", async () => {
    expect.hasAssertions();

    const other = await fetch(`http://127.0.0.1:${String(running.port)}/v2`);
    const method = await call("DELETE", "abc");

    expect(other.status).toBe(404);
    expect(method.status).toBe(405);
  });

  it("never serves a partial file to a concurrent GET", async () => {
    expect.hasAssertions();

    const body = Buffer.alloc(4 * 1024 * 1024, "q");
    const upload = call("PUT", "racing", { body });
    const replies: Reply[] = [];
    const state = { finished: false };

    void upload.finally(() => {
      state.finished = true;
    });

    do {
      replies.push(await call("GET", "racing"));
    } while (!state.finished);

    const intact = replies
      .filter((reply) => reply.status === 200)
      .every((reply) => reply.body.equals(body));

    expect(
      replies
        .map((reply) => reply.status)
        .every((status) => [200, 404].includes(status)),
    ).toBe(true);
    expect(intact).toBe(true);
  });

  describe("with a bucket behind it", () => {
    let bucketWorkspace: TemporaryWorkspace;
    let bucketDirectory: string;
    let bucketServer: RunningServer;
    let bucketBase: string;
    const objects = new Map<string, Buffer>();
    const remote = {
      enabled: (): boolean => true,
      fetch: vi.fn<SharedNxCacheRemoteService["fetch"]>(),
      store: vi.fn<SharedNxCacheRemoteService["store"]>(),
      writable: vi.fn<SharedNxCacheRemoteService["writable"]>(),
    };

    /** Calls the live server and reads the whole reply. */
    const call = async (
      method: string,
      hash: string,
      body?: Buffer,
    ): Promise<{ body: Buffer; status: number }> => {
      const response = await fetch(`${bucketBase}${hash}`, {
        ...(body === undefined ? {} : { body: new Uint8Array(body) }),
        headers: { Authorization: `Bearer ${DEFAULT_TOKEN}` },
        method,
      });

      return {
        body: Buffer.from(await response.arrayBuffer()),
        status: response.status,
      };
    };

    beforeAll(async () => {
      bucketWorkspace = createTemporaryWorkspace();
      bucketDirectory = path.join(bucketWorkspace.root, "cache");

      const module = await Test.createTestingModule({
        providers: [
          SharedNxCacheServerService,
          SharedNxCacheStorageService,
          { provide: SharedNxCacheRemoteService, useValue: remote },
          { provide: ConfigService, useValue: { get: () => undefined } },
          { provide: LoggerService, useValue: createMock<LoggerService>() },
        ],
      }).compile();
      const service = await module.resolve(SharedNxCacheServerService);

      bucketServer = await service.start({
        directory: bucketDirectory,
        port: 0,
      });
      bucketBase = `http://127.0.0.1:${String(bucketServer.port)}/v1/cache/`;
    });

    beforeEach(() => {
      objects.clear();
      remote.fetch.mockImplementation(async (hash) => {
        const found = await Promise.resolve(objects.get(hash));

        return found === undefined
          ? undefined
          : { body: Readable.from([found]), length: found.length };
      });
      remote.store.mockImplementation(async (hash, body) => {
        objects.set(hash, await buffer(body));
      });
      remote.writable.mockReturnValue(true);
    });

    afterEach(() => {
      fs.rmSync(bucketDirectory, { force: true, recursive: true });
      vi.clearAllMocks();
    });

    afterAll(async () => {
      await bucketServer.close();
      bucketWorkspace.remove();
    });

    it("answers a local miss from the bucket and keeps a local copy", async () => {
      expect.hasAssertions();

      objects.set("abc", Buffer.from("from the bucket"));

      const first = await call("GET", "abc");

      objects.clear();

      const second = await call("GET", "abc");

      expect(first.status).toBe(200);
      expect(first.body.toString()).toBe("from the bucket");
      expect(second.body.toString()).toBe("from the bucket");
      expect(remote.fetch).toHaveBeenCalledTimes(1);
    });

    it("answers 404 when neither has the hash", async () => {
      expect.hasAssertions();

      await expect(call("GET", "nowhere")).resolves.toMatchObject({
        status: 404,
      });
    });

    it("does not ask the bucket for a hash it already holds", async () => {
      expect.hasAssertions();

      await call("PUT", "held", Buffer.from("local"));
      remote.fetch.mockClear();

      await expect(call("GET", "held")).resolves.toMatchObject({ status: 200 });
      expect(remote.fetch).not.toHaveBeenCalled();
    });

    it("uploads a stored entry to a writable bucket", async () => {
      expect.hasAssertions();

      const put = await call("PUT", "fresh", Buffer.from("new output"));

      expect(put.status).toBe(200);
      expect(objects.get("fresh")?.toString()).toBe("new output");
    });

    it("keeps an upload local when the bucket is read-only", async () => {
      expect.hasAssertions();

      remote.writable.mockReturnValue(false);

      const put = await call("PUT", "private", Buffer.from("local only"));

      expect(put.status).toBe(200);
      expect(remote.store).not.toHaveBeenCalled();
      await expect(call("GET", "private")).resolves.toMatchObject({
        status: 200,
      });
    });
  });
});
