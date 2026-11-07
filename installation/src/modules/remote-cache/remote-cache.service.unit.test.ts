import fs from "node:fs";
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

import { enterWorkspace } from "../../../testing/environment";
import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { captureReport } from "../../../testing/report";
import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { RemoteCacheService } from "./remote-cache.service";

import type { FakeMachine } from "../../../testing/fake-process-runner";
import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

const KEY_LINE =
  "linode-cli object-storage keys-create --label my-mac-local-nx-cache-read-only --bucket_access.bucket_name organizzolini-codebase-nx-cache --bucket_access.region us-iad-2 --bucket_access.permissions read_only --json";

const KEY_RESPONSE = JSON.stringify([
  { access_key: "ACCESS123", id: 42, secret_key: "SECRET456" },
]);

describe(RemoteCacheService, () => {
  let service: RemoteCacheService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RemoteCacheService,
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(RemoteCacheService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  describe("set up", () => {
    let workspace: TemporaryWorkspace;
    let report: string[];
    let environmentFile: string;

    /** Builds the service over a fake machine. */
    const build = async (
      machine: FakeMachine,
    ): Promise<{ commands: string[]; subject: RemoteCacheService }> => {
      const { commands, runner } = createFakeProcessRunner(machine);
      const module = await Test.createTestingModule({
        providers: [
          RemoteCacheService,
          { provide: ProcessRunnerService, useValue: runner },
          ReporterService,
          { provide: LoggerService, useValue: createMock<LoggerService>() },
        ],
      }).compile();

      return {
        commands,
        subject: await module.resolve(RemoteCacheService),
      };
    };

    beforeEach(() => {
      workspace = createTemporaryWorkspace();
      enterWorkspace(workspace);
      vi.spyOn(os, "hostname").mockReturnValue("My-Mac.local");
      report = captureReport();
      environmentFile = path.join(
        workspace.home,
        ".config/codebase/nx-shared-cache-remote.env",
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
      workspace.remove();
    });

    it("creates a read-only key and keeps it in a private file", async () => {
      const { commands, subject } = await build({
        installed: ["linode-cli"],
        responses: { [KEY_LINE]: { stdout: KEY_RESPONSE } },
      });

      subject.setUpRemoteCache();

      expect(commands).toStrictEqual([KEY_LINE]);
      expect(fs.readFileSync(environmentFile, "utf8")).toBe(
        [
          "NX_SHARED_CACHE_REMOTE_ENDPOINT=https://us-iad-18.linodeobjects.com",
          "NX_SHARED_CACHE_REMOTE_BUCKET=organizzolini-codebase-nx-cache",
          "NX_SHARED_CACHE_REMOTE_REGION=us-east-1",
          "NX_SHARED_CACHE_REMOTE_ACCESS_KEY_ID=ACCESS123",
          "NX_SHARED_CACHE_REMOTE_SECRET_ACCESS_KEY=SECRET456",
          "",
        ].join("\n"),
      );
      expect(fs.statSync(environmentFile).mode.toString(8).slice(-3)).toBe(
        "600",
      );
      expect(report.join("\n")).not.toContain("SECRET456");
    });

    it("leaves a configured machine alone", async () => {
      fs.mkdirSync(path.dirname(environmentFile), { recursive: true });
      fs.writeFileSync(environmentFile, "kept\n");

      const { commands, subject } = await build({ installed: ["linode-cli"] });

      subject.setUpRemoteCache();

      expect(commands).toStrictEqual([]);
      expect(fs.readFileSync(environmentFile, "utf8")).toBe("kept\n");
      expect(report.join("\n")).toContain("already");
    });

    it("writes where NX_SHARED_CACHE_REMOTE_ENV_FILE says", async () => {
      const elsewhere = path.join(workspace.root, "elsewhere.env");

      vi.stubEnv("NX_SHARED_CACHE_REMOTE_ENV_FILE", elsewhere);

      const { subject } = await build({
        installed: ["linode-cli"],
        responses: { [KEY_LINE]: { stdout: KEY_RESPONSE } },
      });

      subject.setUpRemoteCache();

      expect(fs.existsSync(elsewhere)).toBe(true);
      expect(fs.existsSync(environmentFile)).toBe(false);
    });

    it("skips with a hint when linode-cli is not installed", async () => {
      const { commands, subject } = await build({});

      subject.setUpRemoteCache();

      expect(commands).toStrictEqual([]);
      expect(fs.existsSync(environmentFile)).toBe(false);
      expect(report.join("\n")).toContain("linode-cli");
    });

    it("skips when linode-cli cannot create the key", async () => {
      const { subject } = await build({
        installed: ["linode-cli"],
        responses: { [KEY_LINE]: { output: "Not authorized", status: 1 } },
      });

      subject.setUpRemoteCache();

      expect(fs.existsSync(environmentFile)).toBe(false);
      expect(report.join("\n")).toContain("Not authorized");
    });

    it("skips when linode-cli prints something that is not a key", async () => {
      const { subject } = await build({
        installed: ["linode-cli"],
        responses: { [KEY_LINE]: { stdout: "not json" } },
      });

      subject.setUpRemoteCache();

      expect(fs.existsSync(environmentFile)).toBe(false);
      expect(report.join("\n")).toContain("not a key");
    });
  });
});
