import fs from "node:fs";
import path from "node:path";

import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { useTemporaryDirectories } from "../../../testing/mocks";

import { ProcessRunnerService } from "./process-runner.service";

describe(ProcessRunnerService, () => {
  let service: ProcessRunnerService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ProcessRunnerService],
    }).compile();

    service = await module.resolve(ProcessRunnerService);
  });

  describe("captureToFile", () => {
    const makeDirectory = useTemporaryDirectories();

    it("writes the standard output to the file byte for byte", () => {
      expect.hasAssertions();

      const file = path.join(makeDirectory(), "output.bin");
      const result = service.captureToFile(
        process.execPath,
        [
          "-e",
          "process.stdout.write(Buffer.from([0, 255, 128, 10])); process.stderr.write('warned'); process.exit(2)",
        ],
        file,
      );

      expect(result).toStrictEqual({ status: 2, stderr: "warned", stdout: "" });
      expect([...fs.readFileSync(file)]).toStrictEqual([0, 255, 128, 10]);
    });

    it("reports a process that never started as exit code 1", () => {
      expect.hasAssertions();

      const file = path.join(makeDirectory(), "output.bin");
      const result = service.captureToFile(
        "publication-missing-executable",
        [],
        file,
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("ENOENT");
    });
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
