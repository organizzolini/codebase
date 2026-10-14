import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ProcessRunnerService } from "./process-runner.service";

describe(ProcessRunnerService, () => {
  let service: ProcessRunnerService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ProcessRunnerService],
    }).compile();

    service = await module.resolve(ProcessRunnerService);
  });

  describe("captureAsync", () => {
    it("returns both streams and the exit code", async () => {
      expect.hasAssertions();

      const result = await service.captureAsync(process.execPath, [
        "-e",
        "process.stdout.write('printed'); process.stderr.write('warned'); process.exit(3)",
      ]);

      expect(result).toStrictEqual({
        status: 3,
        stderr: "warned",
        stdout: "printed",
      });
    });

    it("closes standard input at once", async () => {
      expect.hasAssertions();

      const result = await service.captureAsync(process.execPath, [
        "-e",
        "process.stdin.pipe(process.stdout)",
      ]);

      expect(result).toStrictEqual({ status: 0, stderr: "", stdout: "" });
    });

    it("reports a process that never started as exit code 1", async () => {
      expect.hasAssertions();

      const result = await service.captureAsync(
        "publication-missing-executable",
        [],
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("ENOENT");
    });
  });
});
