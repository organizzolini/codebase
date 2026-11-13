import "reflect-metadata";

import fs from "node:fs";

import { beforeAll, beforeEach, vi } from "vitest";

import { promptsMock } from "./modules/mocks/mocks.constants";

import type * as Prompts from "prompts";

// Every project mocks `prompts` with the one shared stand-in. This package
// depends on `prompts`, so the id resolves to the copy consumers import. The
// factory imports the stand-in dynamically, as `vi.mock` hoists above static
// imports, and keeps the module's other exports.
vi.mock("prompts", async (importOriginal) => {
  const original = await importOriginal<typeof Prompts>();
  const mocks = await import("./modules/mocks/mocks.constants");

  return { ...original, default: mocks.promptsMock };
});

/**
 * The Vitest setup every project shares: `reflect-metadata` for Nest
 * decorators, an `output` directory for tests that write files, every mock's
 * calls cleared before each test, and console logging silenced behind spies a
 * test can assert on. A project lists it in `setupFiles`.
 */

beforeAll(() => {
  fs.mkdirSync("./output", { recursive: true });
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  // `vi.resetAllMocks` would leave an unanswered prompt resolving `undefined`.
  promptsMock.mockResolvedValue({});
});
