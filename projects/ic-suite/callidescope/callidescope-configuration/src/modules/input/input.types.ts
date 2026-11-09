// 🏷️ Types

import type { PromptObject } from "prompts";

/**
 * The `--format` option every callidescope command shares. Held wide, so the resolver refuses unknown values.
 */
export interface CallidescopeFormatOptions {
  readonly format?: string | undefined;
}

/** Signature used to invoke interactive prompts, injectable for testing. */
export type PromptRunner = <PromptName extends string>(
  promptRequest: PromptObject<PromptName>,
) => Promise<Record<PromptName, unknown>>;
