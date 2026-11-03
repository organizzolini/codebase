import { ConfigService } from "@nestjs/config";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { TaskDatabaseService } from "../task-database/task-database.service";

import { CleanupCodebaseCommand } from "./cleanup-codebase.command";

describe(CleanupCodebaseCommand, () => {
  const verify = vi.fn<TaskDatabaseService["verify"]>();
  const keep = vi.fn<TaskDatabaseService["keep"]>();
  let command: CleanupCodebaseCommand;
  let order: string[];
  let informed: string[];

  beforeAll(async () => {
    const { module } = await buildTestingModule(CleanupCodebaseCommand, {
      providers: [
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: TaskDatabaseService, useValue: { keep, verify } },
      ],
    });

    command = await module.resolve(CleanupCodebaseCommand);
  });

  beforeEach(() => {
    order = [];
    informed = [];
    vi.spyOn(console, "info").mockImplementation((line: string) => {
      informed.push(line);
    });
    verify.mockImplementation(() => {
      order.push("verify");

      return { lines: ["verified"] };
    });
    keep.mockImplementation(() => {
      order.push("keep");

      return { lines: ["kept"] };
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(CleanupCodebaseCommand, {
      providers: [
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: TaskDatabaseService, useValue: { keep, verify } },
      ],
    });

    expect(instance).toBeInstanceOf(CleanupCodebaseCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(CleanupCodebaseCommand, {
      providers: [
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: TaskDatabaseService, useValue: { keep, verify } },
      ],
    });
  });

  it("verifies the database, then keeps the newest", async () => {
    expect.hasAssertions();

    vi.stubEnv("NX_CACHE", "true");

    await command.run();

    expect(order).toStrictEqual(["verify", "keep"]);
    expect(informed).toStrictEqual(["verified", "kept"]);
  });

  it.each([["false"], [""], [undefined]])(
    "leaves the database alone when NX_CACHE is %j",
    async (nxCache) => {
      expect.hasAssertions();

      vi.stubEnv("NX_CACHE", nxCache);

      await command.run();

      expect(order).toStrictEqual([]);
      expect(informed).toStrictEqual([]);
    },
  );
});
