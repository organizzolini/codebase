import os from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LoggerService } from "@codebase/observability";

import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareDatabaseService } from "./software-database.service";

import type { FakeMachine } from "../../../testing/fake-process-runner";
import type * as FileSystem from "node:fs";

const files = vi.hoisted(() => ({
  osRelease: "NAME=Ubuntu\nVERSION_CODENAME=noble\n",
  written: new Map<string, string>(),
}));

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof FileSystem>();

  return {
    ...actual,
    default: {
      ...actual,
      readFileSync: (file: string, encoding: BufferEncoding) =>
        file === "/etc/os-release"
          ? files.osRelease
          : actual.readFileSync(file, encoding),
      writeFileSync: (file: string, content: string) => {
        files.written.set(file, content);
      },
    },
  };
});

const BINARY_DIRECTORY = path.join(os.homedir(), ".local", "bin");

/** Builds the service over a fake machine, and returns it with the command lines it ran. */
async function build(machine: FakeMachine = {}): Promise<{
  commands: string[];
  reporter: ReporterService;
  service: SoftwareDatabaseService;
}> {
  const { commands, runner } = createFakeProcessRunner(machine);
  const reporter = createMock<ReporterService>();
  const module = await Test.createTestingModule({
    providers: [
      SoftwareDatabaseService,
      { provide: ProcessRunnerService, useValue: runner },
      { provide: ReporterService, useValue: reporter },
      { provide: LoggerService, useValue: createMock<LoggerService>() },
    ],
  }).compile();

  return {
    commands,
    reporter,
    service: await module.resolve(SoftwareDatabaseService),
  };
}

describe(SoftwareDatabaseService, () => {
  let service: SoftwareDatabaseService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SoftwareDatabaseService,
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SoftwareDatabaseService);
  });

  beforeEach(() => {
    files.written.clear();
    files.osRelease = "NAME=Ubuntu\nVERSION_CODENAME=noble\n";
    vi.spyOn(process, "getuid").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("on a Mac", () => {
    it("installs and links PostgreSQL 18 through Homebrew", async () => {
      const { commands, service: installer } = await build({
        platform: "darwin",
      });

      installer.installPostgres();

      expect(commands).toContain("brew install postgresql@18");
      expect(commands).toContain("brew link --force --overwrite postgresql@18");
    });
  });

  describe("on Linux", () => {
    it("leaves PostgreSQL alone when pg_dump is already 18", async () => {
      const { commands, service: installer } = await build({
        installed: ["pg_dump"],
        platform: "linux",
        responses: {
          "pg_dump --version": { stdout: "pg_dump (PostgreSQL) 18.6\n" },
        },
      });

      installer.installPostgres();

      expect(commands).toStrictEqual([
        "pg_dump --version",
        "pg_dump --version",
      ]);
    });

    it("adds the PostgreSQL apt repository, installs 18, and links its tools", async () => {
      const { commands, service: installer } = await build({
        installed: ["apt-get"],
        platform: "linux",
      });

      installer.installPostgres();

      expect(files.written.get("/etc/apt/sources.list.d/pgdg.list")).toBe(
        "deb http://apt.postgresql.org/pub/repos/apt noble-pgdg main\n",
      );
      expect(commands).toContain("apt-get install -y -qq postgresql-client-18");
      expect(commands).toContain(`mkdir -p ${BINARY_DIRECTORY}`);
      expect(commands).toContain(
        `ln -sf /usr/lib/postgresql/18/bin/pg_dump ${BINARY_DIRECTORY}/pg_dump`,
      );
      expect(commands).toContain(
        `ln -sf /usr/lib/postgresql/18/bin/pg_restore ${BINARY_DIRECTORY}/pg_restore`,
      );
    });

    it("fails when the machine has no VERSION_CODENAME", async () => {
      files.osRelease = "NAME=Unknown\n";

      const { service: installer } = await build({
        installed: ["apt-get"],
        platform: "linux",
      });

      expect(() => {
        installer.installPostgres();
      }).toThrow("VERSION_CODENAME");
    });

    it("fails when it is not root", async () => {
      vi.spyOn(process, "getuid").mockReturnValue(1000);

      const { service: installer } = await build({
        installed: ["apt-get"],
        platform: "linux",
      });

      expect(() => {
        installer.installPostgres();
      }).toThrow("apt-get is not usable here");
    });

    it("fails when there is no apt-get", async () => {
      const { service: installer } = await build({ platform: "linux" });

      expect(() => {
        installer.installPostgres();
      }).toThrow("apt-get is not usable here");
    });
  });

  describe("squawk", () => {
    it("installs squawk through pnpm when it is missing", async () => {
      const { commands, service: installer } = await build({
        responses: { "squawk --version": { stdout: "squawk 2.70.0\n" } },
      });

      installer.installSquawk();

      expect(commands).toContain("pnpm add -g squawk-cli");
    });

    it("leaves an installed squawk alone", async () => {
      const { commands, service: installer } = await build({
        installed: ["squawk"],
      });

      installer.installSquawk();

      expect(commands.join("\n")).not.toContain("pnpm add");
    });
  });

  it("installs squawk, then PostgreSQL, as one step on a Mac", async () => {
    const { commands, service: installer } = await build({
      platform: "darwin",
    });

    installer.installDatabaseTools();

    expect(commands.indexOf("pnpm add -g squawk-cli")).toBeLessThan(
      commands.indexOf("brew install postgresql@18"),
    );
  });
});
