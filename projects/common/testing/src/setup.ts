import "reflect-metadata";

import fs from "node:fs";

import { beforeAll, beforeEach, vi } from "vitest";

import { promptsMock } from "./modules/mocks/mocks.constants";

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
