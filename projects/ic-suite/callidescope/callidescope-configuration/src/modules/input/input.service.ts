import { Injectable } from "@nestjs/common";
import prompts from "prompts";

import {
  ConfigurationPathRequiredError,
  missingInputError,
  promptCancelledError,
} from "./input.constants";

import type { PromptRunner } from "./input.types";

/**
 * Parses CLI option values and asks for the ones a command still needs.
 *
 * Shared by `callidescope`, `depth`, and `breadth` so the parsing rules for
 * flags they hold in common — `--config`, `--directories`, `--format` — are
 * stated once rather than duplicated per command. Mirrors
 * `@codependix/configuration`'s `InputService`.
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
   * Refuses to draw a prompt nobody can answer. `prompts` would exit 0 without doing anything.
   */
  private assertCanPrompt(subject: string): void {
    if (!this.isAtTerminal()) {
      throw missingInputError(subject);
    }
  }

  /**
   * Narrows suggestions to those containing the typed text. Matches a substring,
   * since a name is more often remembered than its path.
   */
  public completeSuggestions(args: {
    input: string;
    suggestions: readonly string[];
  }): string[] {
    const written = args.input.trim();
    const matches = args.suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(written.toLowerCase()),
    );

    // The typed text stands in only when the list has nothing to offer.
    // Alongside real matches it would put a half-typed query at the top of
    // every list, ahead of the completions that were the point of asking.
    return matches.length === 0 && written.length > 0 ? [written] : matches;
  }

  // 🌎 Public Methods

  /**
   * Whether anybody is there to answer a question. Public so `ConfigurationService.resolveFormatOption` can ask it.
   */
  public isAtTerminal(): boolean {
    return process.stdin.isTTY;
  }

  /**
   * Splits a comma-separated flag into trimmed, non-empty entries. Entries stay relative, resolved later against the workspace root.
   */
  public parseCommaDelimitedOption(value: string | undefined): string[] {
    return value === undefined
      ? []
      : value
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);
  }

  /** Trims an optional string option, treating blank as absent. */
  public parseOptionalOption(value: string | undefined): string | undefined {
    const trimmed = value?.trim();

    return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
  }

  /**
   * Prompts for several values, completing as typed. Selecting nothing is refused,
   * since it cannot be told from an escape.
   */
  public async promptForAutocompleteMultiselect(args: {
    message: string;
    subject: string;
    suggestions: readonly string[];
  }): Promise<string[]> {
    this.assertCanPrompt(args.subject);

    const response = await this.promptRunner({
      choices: args.suggestions.map((value) => ({ title: value, value })),
      message: args.message,
      name: "value",
      suggest: async (input: string) =>
        await Promise.resolve(
          this.completeSuggestions({
            input,
            suggestions: args.suggestions,
          }).map((value) => ({ title: value, value })),
        ),
      type: "autocompleteMultiselect",
    });
    const value: unknown = response.value;

    if (!Array.isArray(value)) {
      throw promptCancelledError(args.subject);
    }

    // Restated as `unknown[]` rather than used as narrowed: `Array.isArray`
    // narrows an `unknown` to `any[]`, which would leave every entry below
    // unchecked and cost the package its type coverage.
    const entries: unknown[] = value;

    if (entries.length === 0) {
      throw promptCancelledError(args.subject);
    }

    const chosen = entries.filter(
      (entry): entry is string => typeof entry === "string",
    );

    if (chosen.length !== entries.length) {
      throw new Error(
        "Prompt resolved to something other than a list of text.",
      );
    }

    return chosen;
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

  /**
   * Trims the configuration path, refusing an absent or blank one, and names the surface it came from.
   */
  public requireConfigurationPath(
    path: string | undefined,
    surface: string,
  ): string {
    const parsed = this.parseOptionalOption(path);

    if (parsed === undefined) {
      throw new ConfigurationPathRequiredError(surface);
    }

    return parsed;
  }
}
