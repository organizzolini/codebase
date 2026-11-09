import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { text } from "node:stream/consumers";

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";

import { SharedNxCacheStorageService } from "./shared-nx-cache-storage.service";
import { TEMPORARY_PREFIX } from "./shared-nx-cache.constants";

import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

const DAY = 24 * 60 * 60 * 1000;

describe(SharedNxCacheStorageService, () => {
  let service: SharedNxCacheStorageService;
  let workspace: TemporaryWorkspace;
  let directory: string;

  /** Writes an entry directly and dates its last use. */
  const seed = (name: string, bytes: number, modified: number): void => {
    const file = path.join(directory, name);

    fs.writeFileSync(file, Buffer.alloc(bytes));
    fs.utimesSync(file, modified / 1000, modified / 1000);
  };

  beforeAll(async () => {
    const { module } = await buildTestingModule(SharedNxCacheStorageService);

    service = await module.resolve(SharedNxCacheStorageService);
  });

  beforeEach(() => {
    workspace = createTemporaryWorkspace();
    directory = path.join(workspace.root, "cache");
    fs.mkdirSync(directory);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    workspace.remove();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SharedNxCacheStorageService);

    expect(instance).toBeInstanceOf(SharedNxCacheStorageService);
  });

  it("stores a body under its hash and leaves no temporary file", async () => {
    expect.hasAssertions();

    const outcome = await service.write({
      body: Readable.from([Buffer.from("hello")]),
      directory,
      hash: "abc123",
      length: 5,
    });

    expect(outcome).toBe("created");
    expect(fs.readdirSync(directory)).toStrictEqual(["abc123"]);
    expect(
      fs.readFileSync(service.entryPath(directory, "abc123"), "utf8"),
    ).toBe("hello");
  });

  it("creates the directory when it is missing", async () => {
    expect.hasAssertions();

    const nested = path.join(directory, "a", "b");

    await service.write({
      body: Readable.from([Buffer.from("x")]),
      directory: nested,
      hash: "abc",
      length: 1,
    });

    expect(fs.existsSync(path.join(nested, "abc"))).toBe(true);
  });

  it("never overwrites an existing entry", async () => {
    expect.hasAssertions();

    seed("abc", 3, Date.now());

    const outcome = await service.write({
      body: Readable.from([Buffer.from("new")]),
      directory,
      hash: "abc",
      length: 3,
    });

    expect(outcome).toBe("exists");
    expect(fs.readFileSync(path.join(directory, "abc"))).toStrictEqual(
      Buffer.alloc(3),
    );
    expect(fs.readdirSync(directory)).toStrictEqual(["abc"]);
  });

  it("discards a body shorter than declared", async () => {
    expect.hasAssertions();

    const outcome = await service.write({
      body: Readable.from([Buffer.from("hi")]),
      directory,
      hash: "abc",
      length: 5,
    });

    expect(outcome).toBe("length-mismatch");
    expect(fs.readdirSync(directory)).toStrictEqual([]);
  });

  it("discards a body longer than declared", async () => {
    expect.hasAssertions();

    const outcome = await service.write({
      body: Readable.from([Buffer.from("too long")]),
      directory,
      hash: "abc",
      length: 2,
    });

    expect(outcome).toBe("length-mismatch");
    expect(fs.readdirSync(directory)).toStrictEqual([]);
  });

  it("discards a body that fails midway", async () => {
    expect.hasAssertions();

    const body = new Readable({
      read(): void {
        this.destroy(new Error("aborted"));
      },
    });

    await expect(
      service.write({ body, directory, hash: "abc", length: 5 }),
    ).resolves.toBe("length-mismatch");
    expect(fs.readdirSync(directory)).toStrictEqual([]);
  });

  it("rethrows a failure that is not about the body", async () => {
    expect.hasAssertions();

    vi.spyOn(fs.promises, "link").mockRejectedValueOnce(
      Object.assign(new Error("disk"), { code: "EIO" }),
    );

    await expect(
      service.write({
        body: Readable.from([Buffer.from("x")]),
        directory,
        hash: "abc",
        length: 1,
      }),
    ).rejects.toThrow("disk");
    expect(fs.readdirSync(directory)).toStrictEqual([]);
  });

  it("reports whether an entry exists", async () => {
    expect.hasAssertions();

    seed("abc", 1, Date.now());

    await expect(service.exists(directory, "abc")).resolves.toBe(true);
    await expect(service.exists(directory, "missing")).resolves.toBe(false);
  });

  it("reads an entry back", async () => {
    expect.hasAssertions();

    fs.writeFileSync(path.join(directory, "abc"), "body");

    await expect(text(service.read(directory, "abc"))).resolves.toBe("body");
  });

  it("marks an entry as used by touching it", async () => {
    expect.hasAssertions();

    seed("abc", 1, Date.now() - 10 * DAY);

    await service.touch(directory, "abc");

    expect(
      Date.now() - fs.statSync(path.join(directory, "abc")).mtimeMs,
    ).toBeLessThan(DAY);
  });

  it("ignores touching an entry that is gone", async () => {
    expect.hasAssertions();

    await expect(service.touch(directory, "gone")).resolves.toBeUndefined();
  });

  it("evicts nothing when the directory does not exist", async () => {
    expect.hasAssertions();

    await expect(
      service.evict(path.join(directory, "missing")),
    ).resolves.toStrictEqual({ removed: 0 });
  });

  it("evicts entries unused for 14 days and keeps the rest", async () => {
    expect.hasAssertions();

    const now = Date.now();

    seed("old", 1, now - 15 * DAY);
    seed("recent", 1, now - 13 * DAY);

    await expect(
      service.evict(directory, undefined, now),
    ).resolves.toStrictEqual({ removed: 1 });
    expect(fs.readdirSync(directory)).toStrictEqual(["recent"]);
  });

  it("evicts the oldest entries while the directory is over its size", async () => {
    expect.hasAssertions();

    const now = Date.now();

    seed("oldest", 10, now - 3000);
    seed("middle", 10, now - 2000);
    seed("newest", 10, now - 1000);

    const result = await service.evict(
      directory,
      { maximumAgeMilliseconds: DAY, maximumBytes: 15 },
      now,
    );

    expect(result).toStrictEqual({ removed: 2 });
    expect(fs.readdirSync(directory)).toStrictEqual(["newest"]);
  });

  it("removes abandoned uploads but not recent ones, and skips other files", async () => {
    expect.hasAssertions();

    const now = Date.now();

    seed(`${TEMPORARY_PREFIX}old`, 1, now - 2 * 60 * 60 * 1000);
    seed(`${TEMPORARY_PREFIX}new`, 1, now - 1000);
    seed("not.a.hash", 1, now - 30 * DAY);
    fs.mkdirSync(path.join(directory, "folder"));

    await service.evict(directory, undefined, now);

    expect(fs.readdirSync(directory).toSorted()).toStrictEqual([
      `${TEMPORARY_PREFIX}new`,
      "folder",
      "not.a.hash",
    ]);
  });
});
