import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { promptsMock } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { InputPromptingService } from "./input-prompting.service";
import { InputSchemaService } from "./input-schema.service";

import type { PromptObject } from "prompts";

/** Narrows what `prompts` was called with to one prompt object, not a list. */
function isSinglePrompt(value: unknown): value is PromptObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

describe(InputPromptingService, () => {
  let service: InputPromptingService;

  beforeAll(async () => {
    const built = await buildTestingModule(InputPromptingService, {
      providers: [InputSchemaService],
    });

    service = built.instance;
  });

  const originalIsTty = process.stdin.isTTY;

  beforeEach(() => {
    promptsMock.mockReset();
    // A terminal, so each test exercises the prompt rather than the refusal
    // standing in front of it.
    process.stdin.isTTY = true;
  });

  afterEach(() => {
    process.stdin.isTTY = originalIsTty;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(InputPromptingService, {
      providers: [InputSchemaService],
    });

    expect(instance).toBeInstanceOf(InputPromptingService);
  });

  describe("promptForInput", () => {
    it("returns the answer the caller typed", async () => {
      promptsMock.mockResolvedValue({ value: "my-widget" });

      await expect(
        service.promptForInput({
          inputName: "name",
          isRequired: true,
          propertySchema: { type: "string" },
        }),
      ).resolves.toBe("my-widget");
    });

    it("returns nothing when the prompt is cancelled", async () => {
      promptsMock.mockResolvedValue({});

      await expect(
        service.promptForInput({
          inputName: "name",
          isRequired: true,
          propertySchema: { type: "string" },
        }),
      ).resolves.toBeUndefined();
    });

    it("hands prompts a validator backed by the schema", async () => {
      promptsMock.mockResolvedValue({ value: "my-widget" });

      await service.promptForInput({
        inputName: "name",
        isRequired: true,
        propertySchema: { type: "string" },
      });

      const options: unknown = promptsMock.mock.calls[0]?.[0];

      if (!isSinglePrompt(options)) {
        throw new Error("prompts was not called with a single prompt");
      }

      // The extra arguments are prompts' own signature: previous answers and
      // the prompt itself, neither of which this validator reads.
      expect(options.validate?.("my-widget", {}, options)).toBe(true);
      expect(options.validate?.("", {}, options)).toBe("name is required");
    });

    it("offers a choice list when the schema declares an enum", async () => {
      promptsMock.mockResolvedValue({ value: "packages" });

      await service.promptForInput({
        inputName: "type",
        isRequired: true,
        propertySchema: { enum: ["applications", "packages"] },
      });

      expect(promptsMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "select" }),
      );
    });

    it("asks for free text when the schema declares no enum", async () => {
      promptsMock.mockResolvedValue({ value: "my-widget" });

      await service.promptForInput({
        inputName: "name",
        isRequired: true,
        propertySchema: { type: "string" },
      });

      expect(promptsMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "text" }),
      );
    });

    it("returns nothing when the caller cancels", async () => {
      promptsMock.mockResolvedValue({});

      await expect(
        service.promptForInput({
          inputName: "name",
          isRequired: true,
          propertySchema: { type: "string" },
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe("promptForTemplate", () => {
    const TEMPLATES = [
      { description: "A NestJS service module", name: "nestjs-service-module" },
      { name: "react-component-folder" },
    ];

    it("returns the template the caller chose", async () => {
      promptsMock.mockResolvedValue({ template: "react-component-folder" });

      await expect(service.promptForTemplate(TEMPLATES)).resolves.toBe(
        "react-component-folder",
      );
    });

    // Filtering as you type is the whole reason a long template name is
    // cheap to select, so the prompt type is asserted rather than assumed.
    it("asks with an autocomplete over the configured templates", async () => {
      promptsMock.mockResolvedValue({ template: "react-component-folder" });

      await service.promptForTemplate(TEMPLATES);

      expect(promptsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          choices: [
            {
              description: "A NestJS service module",
              title: "nestjs-service-module",
              value: "nestjs-service-module",
            },
            {
              title: "react-component-folder",
              value: "react-component-folder",
            },
          ],
          type: "autocomplete",
        }),
      );
    });

    it("returns nothing when the prompt is cancelled", async () => {
      promptsMock.mockResolvedValue({});

      await expect(
        service.promptForTemplate(TEMPLATES),
      ).resolves.toBeUndefined();
    });
  });

  describe("promptForTemplates", () => {
    const TEMPLATES = [
      { description: "A NestJS service module", name: "nestjs-service-module" },
    ];

    it("returns every template the caller ticked", async () => {
      promptsMock.mockResolvedValue({
        templates: ["nestjs-service-module", "react-component-folder"],
      });

      await expect(
        service.promptForTemplates(TEMPLATES),
      ).resolves.toStrictEqual([
        "nestjs-service-module",
        "react-component-folder",
      ]);
    });

    // The flag and the picker have to be able to express the same set, and
    // `--templates all` is how the flag says "every template".
    it("offers the all sentinel alongside the configured templates", async () => {
      promptsMock.mockResolvedValue({ templates: ["all"] });

      await service.promptForTemplates(TEMPLATES);

      expect(promptsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          choices: [
            expect.objectContaining({ title: "all", value: "all" }) as unknown,
            expect.objectContaining({
              description: "A NestJS service module",
              value: "nestjs-service-module",
            }) as unknown,
          ],
          type: "autocompleteMultiselect",
        }),
      );
    });

    it("returns nothing when the prompt is cancelled", async () => {
      promptsMock.mockResolvedValue({});

      await expect(
        service.promptForTemplates(TEMPLATES),
      ).resolves.toBeUndefined();
    });

    // Ticking nothing is not a narrowing, so it reads as no answer rather
    // than as "no templates", which would validate nothing at all.
    it("returns nothing when the caller ticks no template", async () => {
      promptsMock.mockResolvedValue({ templates: [] });

      await expect(
        service.promptForTemplates(TEMPLATES),
      ).resolves.toBeUndefined();
    });
  });

  describe("isAtTerminal", () => {
    it.each([
      [true, true],
      [false, false],
    ])("reads a stdin isTTY of %s as %s", (isTty, expected) => {
      process.stdin.isTTY = isTty;

      expect(service.isAtTerminal()).toBe(expected);
    });

    // `prompts` would otherwise draw its menu, never resolve, and let the
    // process exit 0 having generated nothing.
    it("refuses to prompt when stdin is not a terminal", async () => {
      process.stdin.isTTY = false;

      await expect(
        service.promptForInput({
          inputName: "name",
          isRequired: true,
          propertySchema: { type: "string" },
        }),
      ).rejects.toThrow(
        "name is required, and stdin is not a terminal so it cannot be asked for. Pass --name.",
      );
      expect(promptsMock).not.toHaveBeenCalled();
    });
  });
});
