import fs from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/logging";

import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";

import { ProcessRunnerService } from "./process-runner.service";

describe(ProcessRunnerService, () => {
  let service: ProcessRunnerService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProcessRunnerService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(ProcessRunnerService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  describe("run", () => {
    it("captures standard output and merges both streams", () => {
      expect.hasAssertions();

      const result = service.run(
        process.execPath,
        ["-e", "console.log('out'); console.error('err')"],
        { capture: true },
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toBe("out\n");
      expect(result.output).toContain("err");
    });

    it("runs without capturing, leaving the output for the terminal", () => {
      expect.hasAssertions();
      expect(service.run(process.execPath, ["-e", "0"])).toStrictEqual({
        output: "",
        status: 0,
        stdout: "",
      });
    });

    it("reports a missing command as a null status rather than throwing", () => {
      expect.hasAssertions();
      expect(
        service.run("no-such-command-here", [], { capture: true }),
      ).toStrictEqual({ output: "", status: null, stdout: "" });
    });

    it("runs where it is told and with the variables it is given", () => {
      expect.hasAssertions();

      const workspace = createTemporaryWorkspace();
      const result = service.run(
        process.execPath,
        ["-e", "console.log(process.cwd() + ':' + process.env.SETUP_PROBE)"],
        {
          capture: true,
          cwd: workspace.root,
          environment: { SETUP_PROBE: "set" },
        },
      );
      const expected = `${fs.realpathSync(workspace.root)}:set`;
      workspace.remove();

      expect(result.stdout.trim()).toBe(expected);
    });
  });

  describe("runOrThrow", () => {
    it("returns the result of a command that succeeds", () => {
      expect.hasAssertions();
      expect(
        service.runOrThrow(process.execPath, ["-e", "0"], { capture: true })
          .status,
      ).toBe(0);
    });

    it("throws, naming the command line, when one fails", () => {
      expect.hasAssertions();
      expect(() =>
        service.runOrThrow(process.execPath, ["-e", "process.exit(3)"], {
          capture: true,
        }),
      ).toThrow(/-e process.exit\(3\)` failed with status 3/);
    });
  });

  describe("locate", () => {
    it("finds a command on the path", () => {
      expect.hasAssertions();
      expect(service.locate(path.basename(process.execPath))).toBeDefined();
    });

    it("returns undefined when there is no path to search", () => {
      expect.hasAssertions();

      vi.stubEnv("PATH", undefined);

      expect(service.locate(path.basename(process.execPath))).toBeUndefined();

      vi.unstubAllEnvs();
    });

    it("returns undefined for one that is not there", () => {
      expect.hasAssertions();
      expect(service.locate("no-such-command-here")).toBeUndefined();
    });
  });

  describe("startDetached", () => {
    it("starts a command without waiting for it", () => {
      expect.hasAssertions();
      expect(() => {
        service.startDetached(process.execPath, ["-e", "0"]);
      }).not.toThrow();
    });
  });

  describe("sleep", () => {
    it("resolves after the wait", async () => {
      expect.hasAssertions();
      await expect(service.sleep(0)).resolves.toBeUndefined();
    });
  });
});
