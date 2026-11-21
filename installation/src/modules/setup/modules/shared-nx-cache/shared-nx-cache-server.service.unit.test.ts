import http from "node:http";

import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { SharedNxCacheRemoteService } from "./shared-nx-cache-remote.service";
import { SharedNxCacheServerService } from "./shared-nx-cache-server.service";
import { SharedNxCacheStorageService } from "./shared-nx-cache-storage.service";
import {
  DEFAULT_TOKEN,
  EVICTION_INTERVAL_MILLISECONDS,
} from "./shared-nx-cache.constants";

import type { RunningServer } from "./shared-nx-cache.types";

describe(SharedNxCacheServerService, () => {
  let running: RunningServer | undefined;

  /** Builds the service over a mocked storage and a configured token. */
  const create = async (
    token?: string,
  ): Promise<{
    service: SharedNxCacheServerService;
    storage: SharedNxCacheStorageService;
  }> => {
    const storage = createMock<SharedNxCacheStorageService>({
      evict: vi
        .fn<SharedNxCacheStorageService["evict"]>()
        .mockResolvedValue({ removed: 0 }),
      exists: vi
        .fn<SharedNxCacheStorageService["exists"]>()
        .mockResolvedValue(false),
    });
    const { module } = await buildTestingModule(SharedNxCacheServerService, {
      providers: [
        { provide: SharedNxCacheStorageService, useValue: storage },
        {
          provide: SharedNxCacheRemoteService,
          useValue: createMock<SharedNxCacheRemoteService>({
            fetch: vi
              .fn<SharedNxCacheRemoteService["fetch"]>()
              .mockResolvedValue(undefined),
          }),
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn<ConfigService["get"]>().mockReturnValue(token),
          },
        },
      ],
    });

    return {
      service: await module.resolve(SharedNxCacheServerService),
      storage,
    };
  };

  /** Sends a GET for `hash` with an optional bearer token. */
  const get = async (
    port: number,
    token: string | undefined,
  ): Promise<number> =>
    new Promise((resolve, reject) => {
      http
        .get(
          {
            headers:
              token === undefined ? {} : { Authorization: `Bearer ${token}` },
            host: "127.0.0.1",
            path: "/v1/cache/abc",
            port,
          },
          (response) => {
            response.resume();
            resolve(response.statusCode ?? 0);
          },
        )
        .on("error", reject);
    });

  afterEach(async () => {
    await running?.close();
    running = undefined;
    vi.useRealTimers();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SharedNxCacheServerService, {
      mocks: [
        SharedNxCacheStorageService,
        SharedNxCacheRemoteService,
        ConfigService,
      ],
    });

    expect(instance).toBeInstanceOf(SharedNxCacheServerService);
  });

  it("accepts the built-in token when none is configured", async () => {
    expect.hasAssertions();

    const { service: subject } = await create();

    running = await subject.start({ directory: "unused", port: 0 });

    await expect(get(running.port, DEFAULT_TOKEN)).resolves.toBe(404);
  });

  it("accepts only the configured token when one is set", async () => {
    expect.hasAssertions();

    const { service: subject } = await create("secret");

    running = await subject.start({ directory: "unused", port: 0 });

    await expect(get(running.port, "secret")).resolves.toBe(404);
    await expect(get(running.port, DEFAULT_TOKEN)).resolves.toBe(401);
    await expect(get(running.port, undefined)).resolves.toBe(401);
  });

  it("falls back to the built-in token when the configured one is empty", async () => {
    expect.hasAssertions();

    const { service: subject } = await create("");

    running = await subject.start({ directory: "unused", port: 0 });

    await expect(get(running.port, DEFAULT_TOKEN)).resolves.toBe(404);
  });

  it("evicts on startup and hourly until closed", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });

    const { service: subject, storage } = await create();

    running = await subject.start({ directory: "cache", port: 0 });

    expect(storage.evict).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(EVICTION_INTERVAL_MILLISECONDS);

    expect(storage.evict).toHaveBeenCalledTimes(2);

    await running.close();
    running = undefined;
    vi.advanceTimersByTime(EVICTION_INTERVAL_MILLISECONDS * 3);

    expect(storage.evict).toHaveBeenCalledTimes(2);
  });

  it("keeps serving when an eviction fails", async () => {
    expect.hasAssertions();

    const { service: subject, storage } = await create();

    vi.mocked(storage.evict).mockRejectedValue(new Error("disk"));
    running = await subject.start({ directory: "cache", port: 0 });

    await expect(get(running.port, DEFAULT_TOKEN)).resolves.toBe(404);
  });

  it("answers 500 when storage fails", async () => {
    expect.hasAssertions();

    const { service: subject, storage } = await create();

    vi.mocked(storage.exists).mockRejectedValue(new Error("disk"));
    running = await subject.start({ directory: "cache", port: 0 });

    await expect(get(running.port, DEFAULT_TOKEN)).resolves.toBe(500);
  });
});
