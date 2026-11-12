import { Injectable } from "@nestjs/common";
import prompts from "prompts";

import { missingInputError, promptCancelledError } from "./input.constants";

import type { PromptRunner } from "./input.types";

/**
 * Parses CLI option values and asks for the ones a command still needs.
 *
 * Lives here rather than in `codependix-cli` so the shared flag rules are
 * stated once, beside the configuration those flags select. Mirrors
 * `@callidescope/configuration`'s `InputService`.
 */
@Injectable()
export class InputService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  /** Overridable so tests never touch a real terminal. */
  private readonly promptRunner: PromptRunner = prompts;

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Refuses a prompt nobody can answer: `prompts` would exit 0 on non-TTY stdin having done nothing.
   */
  private assertCanPrompt(subject: string): void {
    if (!process.stdin.isTTY) {
      throw missingInputError(subject);
    }
  }

  // 🌎 Public Methods

  /**
   * Parses a comma-separated list, dropping blank entries. An absent flag is an empty list, so "left off" and "named nothing" behave the same.
   */
  public parseCommaDelimitedOption(value: string | undefined): string[] {
    return value === undefined
      ? []
      : value
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);
  }

  /**
   * Parses a valueless boolean flag: present means true. Commander passes `undefined`, so reading that as false would disable every such flag.
   */
  public parseFlagOption(value: boolean | undefined): boolean {
    return value ?? true;
  }

  /** Trims an optional string option, treating blank as absent. */
  public parseOptionalOption(value: string | undefined): string | undefined {
    const trimmed = value?.trim();

    return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
  }

  /**
   * Parses a path option, defaulting to the working directory. Left unresolved, since resolving twice makes a relative path ambiguous.
   */
  public parsePathOption(value: string | undefined): string {
    return this.parseOptionalOption(value) ?? process.cwd();
  }

  /** Prompts for one value out of a fixed set of choices. */
  public async promptForSelect<Choice extends string>(args: {
    choices: readonly Choice[];
    message: string;
    subject: string;
  }): Promise<Choice> {
    this.assertCanPrompt(args.subject);

    const response = await this.promptRunner({
      choices: args.choices.map((choice) => ({ title: choice, value: choice })),
      message: args.message,
      name: "value",
      type: "select",
    });
    const value: unknown = response.value;

    if (value === undefined) {
      throw promptCancelledError(args.subject);
    }

    const matched = args.choices.find((choice) => choice === value);

    if (matched === undefined) {
      throw new Error(
        `Prompt did not resolve to one of: ${args.choices.join(", ")}.`,
      );
    }

    return matched;
  }
}
