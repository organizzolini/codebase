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
  answerPrompts,
  overrideEnvironment,
  promptsMock,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { missingInputError, promptCancelledError } from "./input.constants";
import { InputService } from "./input.service";

import type * as Testing from "@codebase/testing";

// Mocked at the module boundary so the service's own wiring is exercised and
// no test ever reaches for a terminal.
vi.mock("prompts", async () => {
  const { promptsMock } =
    await vi.importActual<typeof Testing>("@codebase/testing");

  return { default: promptsMock };
});

describe(InputService, () => {
  let service: InputService;

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(InputService));
  });

  const originalIsTty = process.stdin.isTTY;

  beforeEach(() => {
    overrideEnvironment({ CI: undefined });
  });

  afterEach(() => {
    process.stdin.isTTY = originalIsTty;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(InputService);

    expect(instance).toBeInstanceOf(InputService);
  });

  // 📋 Comma-delimited option

  it("splits a comma-delimited option, trimming each entry", () => {
    expect(service.parseCommaDelimitedOption("alpha, beta")).toStrictEqual([
      "alpha",
      "beta",
    ]);
  });

  it("drops blank entries from a comma-delimited option", () => {
    expect(service.parseCommaDelimitedOption("alpha,,beta,")).toStrictEqual([
      "alpha",
      "beta",
    ]);
  });

  it("reads an absent comma-delimited option as an empty list", () => {
    expect(service.parseCommaDelimitedOption(undefined)).toStrictEqual([]);
  });

  // 🚩 Flag option

  it("reads a valueless boolean flag as present", () => {
    expect(service.parseFlagOption(undefined)).toBe(true);
  });

  it("passes an explicit boolean flag value through", () => {
    expect(service.parseFlagOption(false)).toBe(false);
  });

  // 🔡 Optional option

  it("passes a non-blank optional option through trimmed", () => {
    expect(service.parseOptionalOption("  codependix.config.ts  ")).toBe(
      "codependix.config.ts",
    );
  });

  it("reads a blank optional option as absent", () => {
    expect(service.parseOptionalOption("   ")).toBeUndefined();
  });

  it("reads an absent optional option as absent", () => {
    expect(service.parseOptionalOption(undefined)).toBeUndefined();
  });

  // 📂 Path option

  it("passes a given path option through trimmed", () => {
    expect(service.parsePathOption("  packages/logging  ")).toBe(
      "packages/logging",
    );
  });

  it("falls back to the working directory for an absent path option", () => {
    expect(service.parsePathOption(undefined)).toBe(process.cwd());
  });

  it("falls back to the working directory for a blank path option", () => {
    expect(service.parsePathOption("   ")).toBe(process.cwd());
  });

  // 🗣️ Prompting

  it("resolves a select prompt to the choice the user picked", async () => {
    process.stdin.isTTY = true;
    answerPrompts({ value: "write" });

    await expect(
      service.promptForSelect({
        choices: ["check", "write"],
        message: "Which mode?",
        subject: "A run mode",
      }),
    ).resolves.toBe("write");
  });

  it("rejects a select prompt that resolved outside its choices", async () => {
    process.stdin.isTTY = true;
    answerPrompts({ value: "nonsense" });

    await expect(
      service.promptForSelect({
        choices: ["check", "write"],
        message: "Which mode?",
        subject: "A run mode",
      }),
    ).rejects.toThrow("Prompt did not resolve to one of");
  });

  it("reports a dismissed select prompt as cancelled, not as a fault", async () => {
    process.stdin.isTTY = true;
    answerPrompts({});

    await expect(
      service.promptForSelect({
        choices: ["check", "write"],
        message: "Which mode?",
        subject: "A run mode",
      }),
    ).rejects.toThrow(promptCancelledError("A run mode").message);
  });

  // `prompts` draws its menu on a non-terminal stdin, never resolves, and lets
  // the process exit 0 — so the refusal has to come before it is ever called.
  it("refuses to draw a prompt when stdin is not a terminal", async () => {
    process.stdin.isTTY = false;

    await expect(
      service.promptForSelect({
        choices: ["check", "write"],
        message: "Which mode?",
        subject: "A run mode",
      }),
    ).rejects.toThrow(missingInputError("A run mode").message);
    expect(promptsMock).not.toHaveBeenCalled();
  });
});
