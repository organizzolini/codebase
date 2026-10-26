import { vi } from "vitest";

import type { PromptAnswers } from "./mocks.types";

/**
 * The stand-in for the `prompts` package's default export; a test file
 * replaces the package with it, then queues answers with `answerPrompts`:
 *
 * ```ts
 * vi.mock("prompts", async () => ({
 *   default: (await import("@codebase/testing")).promptsMock,
 * }));
 * ```
 *
 * A call with no answer queued resolves with none, as a cancelled prompt does.
 */
export const promptsMock = vi
  .fn<(questions: unknown) => Promise<PromptAnswers>>()
  .mockResolvedValue({});
