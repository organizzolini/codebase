// 🏷️ Types

import type { PromptObject } from "prompts";

/** Shared `--format` option. Held wide, so the resolver refuses unknowns. */
export interface CallidescopeFormatOptions {
  readonly format?: string | undefined;
}

/** Signature used to invoke interactive prompts, injectable for testing. */
export type PromptRunner = <PromptName extends string>(
  promptRequest: PromptObject<PromptName>,
) => Promise<Record<PromptName, unknown>>;
