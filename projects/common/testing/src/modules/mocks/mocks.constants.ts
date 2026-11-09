import { vi } from "vitest";

import type { PromptAnswers } from "./mocks.types";

/**
 * Stand-in for the `prompts` default export. Queue answers with
 * `answerPrompts`; an unqueued call resolves empty, as a cancelled prompt does.
 */
export const promptsMock = vi
  .fn<(questions: unknown) => Promise<PromptAnswers>>()
  .mockResolvedValue({});
