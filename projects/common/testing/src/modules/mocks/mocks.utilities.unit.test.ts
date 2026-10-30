import { execFileSync, spawnSync } from "node:child_process";
import * as NodeFileSystem from "node:fs";

import { describe, expect, it, vi } from "vitest";

import {
  createTemporaryDirectory,
  useTemporaryDirectory,
} from "../temporary-directory/temporary-directory.utilities";

import { promptsMock } from "./mocks.constants";
import {
  answerPrompts,
  mockChildProcess,
  mockFileSystem,
  mockPartially,
  stubFetch,
} from "./mocks.utilities";

import type * as TemporaryDirectory from "../temporary-directory/temporary-directory.utilities";
import type * as ChildProcess from "node:child_process";

// 🧪 Tests

vi.mock("node:child_process", async (importOriginal) => {
  const mocks = await import("./mocks.utilities");

  return mocks.mockChildProcess(await importOriginal<typeof ChildProcess>());
});

vi.mock(
  import("../temporary-directory/temporary-directory.utilities"),
  async (importOriginal) => {
    const mocks = await import("./mocks.utilities");

    return mocks.mockPartially(
      await importOriginal<typeof TemporaryDirectory>(),
      { createTemporaryDirectory: () => "/replaced" },
    );
  },
);

/** The text a fetched response carries. */
async function textOf(response: Promise<Response>): Promise<string> {
  const resolved = await response;

  return resolved.text();
}

describe("mocks", () => {
  describe(mockFileSystem, () => {
    it("replaces selected reads and keeps other overloads real", () => {
      const fileSystem = mockFileSystem(NodeFileSystem, {
        buffer: () => Buffer.from("mocked bytes"),
        utf8: () => "mocked source",
      });
      const sourcePath = new URL(import.meta.url);

      expect(fileSystem.readFileSync("source.ts", "utf8")).toBe(
        "mocked source",
      );
      expect(fileSystem.readFileSync("binary.bin")).toStrictEqual(
        Buffer.from("mocked bytes"),
      );
      expect(fileSystem.readFileSync(sourcePath)).toStrictEqual(
        NodeFileSystem.readFileSync(sourcePath),
      );
    });
  });

  describe(mockChildProcess, () => {
    it("runs the real process until a test stages a result", () => {
      const script = "process.stdout.write('ran')";

      expect(execFileSync("node", ["--eval", script]).toString()).toBe("ran");
      expect(vi.mocked(execFileSync)).toHaveBeenCalledWith("node", [
        "--eval",
        script,
      ]);
    });

    it("lets a test stage what a process returns", () => {
      vi.mocked(spawnSync).mockReturnValueOnce({
        output: [],
        pid: 1,
        signal: null,
        status: 7,
        stderr: Buffer.from(""),
        stdout: Buffer.from("staged"),
      });

      const result = spawnSync("anything");

      expect(result.status).toBe(7);
      expect(result.stdout.toString()).toBe("staged");
    });
  });

  describe(mockPartially, () => {
    it("replaces only the members it is given, keeping the rest real", () => {
      expect(createTemporaryDirectory("ignored")).toBe("/replaced");
      expect(useTemporaryDirectory).toBeTypeOf("function");
      expect(vi.isMockFunction(useTemporaryDirectory)).toBe(false);
    });
  });

  describe(stubFetch, () => {
    const realFetch = globalThis.fetch;

    it("answers each request with the next queued response, then rejects with the next error", async () => {
      const fetchMock = stubFetch(
        new Response("first"),
        new Response("second", { status: 404 }),
        new TypeError("offline"),
      );

      await expect(textOf(fetch("https://example.com/1"))).resolves.toBe(
        "first",
      );
      await expect(fetch("https://example.com/2")).resolves.toHaveProperty(
        "status",
        404,
      );
      await expect(fetch("https://example.com/3")).rejects.toThrow("offline");
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock).toHaveBeenNthCalledWith(1, "https://example.com/1");
    });

    it("restores the real fetch once the test finishes", () => {
      expect(globalThis.fetch).toBe(realFetch);
    });
  });

  describe(answerPrompts, () => {
    it("answers each prompt in turn", async () => {
      answerPrompts({ name: "Ovid" }, { confirmed: true });

      await expect(promptsMock({ name: "name" })).resolves.toStrictEqual({
        name: "Ovid",
      });
      await expect(promptsMock({ name: "confirmed" })).resolves.toStrictEqual({
        confirmed: true,
      });
    });

    it("leaves an answer queued while its test runs", async () => {
      answerPrompts({ unused: true });

      await expect(promptsMock({ name: "unused" })).resolves.toStrictEqual({
        unused: true,
      });

      answerPrompts({ dropped: true });
    });

    it("starts each test with no answers queued, answering as a cancelled prompt does", async () => {
      await expect(promptsMock({ name: "next" })).resolves.toStrictEqual({});
    });
  });
});
