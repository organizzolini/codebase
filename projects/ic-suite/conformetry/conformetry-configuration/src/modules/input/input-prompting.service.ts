import { Injectable } from "@nestjs/common";
import prompts from "prompts";

import { InputSchemaService } from "./input-schema.service";
import { ALL_TEMPLATES_SELECTION, missingInputError } from "./input.constants";

import type { PromptRunner, SchemaInput, TemplateChoice } from "./input.types";

/**
 * Asks the user for input values interactively, and for the template to run.
 *
 * Refuses rather than prompting when nobody can answer, so a non-terminal run cannot hang.
 */
@Injectable()
export class InputPromptingService {
  // 🏗 Dependency Injection

  constructor(private readonly inputSchemaService: InputSchemaService) {}

  // 🔐 Private Fields

  /** Overridable so tests never touch a real terminal. */
  private readonly promptRunner: PromptRunner = prompts;

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Refuses to draw a prompt nobody can answer.
   *
   * `prompts` would otherwise exit 0 with nothing generated.
   */
  private assertCanPrompt(inputName: string): void {
    if (!this.isAtTerminal()) {
      throw missingInputError(inputName);
    }
  }

  /** Renders one template as a choice, omitting an absent description. */
  private describeChoice(template: TemplateChoice): {
    description?: string;
    title: string;
    value: string;
  } {
    return {
      ...(template.description === undefined
        ? {}
        : { description: template.description }),
      title: template.name,
      value: template.name,
    };
  }

  // 🌎 Public Methods

  /**
   * Whether anybody is there to answer a question.
   *
   * `isTTY` is tested as falsy: it is `undefined` off a terminal, despite its `boolean` type.
   */
  public isAtTerminal(): boolean {
    return process.stdin.isTTY;
  }

  /**
   * Prompts for one value, offering a choice list when the schema declares an
   * `enum` and free text otherwise.
   */
  public async promptForInput(input: SchemaInput): Promise<string | undefined> {
    this.assertCanPrompt(input.inputName);

    const enumValues = this.inputSchemaService.readEnumValues(
      input.propertySchema,
    );
    const response = await this.promptRunner({
      ...(enumValues.length > 0
        ? {
            choices: enumValues.map((value) => ({ title: value, value })),
            type: "select",
          }
        : { type: "text" }),
      message: this.inputSchemaService.readPromptMessage(input),
      name: "value",
      validate: (value: unknown): string | true => {
        return this.inputSchemaService.validateValue({ input, value });
      },
    });
    const value: unknown = response.value;

    return typeof value === "string" ? value : undefined;
  }

  /**
   * Asks which single template to run, with autocomplete since template names are long.
   */
  public async promptForTemplate(
    templates: readonly TemplateChoice[],
  ): Promise<string | undefined> {
    const response = await this.promptRunner({
      choices: templates.map((template) => this.describeChoice(template)),
      message: "Which template should be rendered?",
      name: "template",
      type: "autocomplete",
    });
    const value: unknown = response.template;

    return typeof value === "string" ? value : undefined;
  }

  /**
   * Asks which templates to narrow a run to, offering the `all` sentinel alongside them.
   *
   * Ticking nothing means no narrowing, not an empty one.
   */
  public async promptForTemplates(
    templates: readonly TemplateChoice[],
  ): Promise<string[] | undefined> {
    const response = await this.promptRunner({
      choices: [
        {
          description: "Every configured template",
          title: ALL_TEMPLATES_SELECTION,
          value: ALL_TEMPLATES_SELECTION,
        },
        ...templates.map((template) => this.describeChoice(template)),
      ],
      message: "Which templates should be validated?",
      name: "templates",
      type: "autocompleteMultiselect",
    });
    const value: unknown = response.templates;

    if (!Array.isArray(value)) {
      return undefined;
    }

    const entries: unknown[] = value;
    const selected = entries.filter((entry) => typeof entry === "string");

    return selected.length === 0 ? undefined : selected;
  }
}
