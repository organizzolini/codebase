import { vi } from "vitest";

import type { PromptAnswers } from "./mocks.types";

/** Stand-in for `prompts`. Queue answers with `answerPrompts`, else empty. */
export const promptsMock = vi
  .fn<(questions: unknown) => Promise<PromptAnswers>>()
  .mockResolvedValue({});
