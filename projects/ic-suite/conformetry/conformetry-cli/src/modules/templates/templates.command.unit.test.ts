import path from "node:path";

import { ConfigurationService } from "@conformetry/configuration";
import { InventoryService } from "@conformetry/output";
import { createMock } from "@golevelup/ts-vitest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { captureExitCode } from "@codebase/testing";
import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { TemplatesCommand } from "./templates.command";

import type { LoggerService } from "@codebase/observability";
import type { InventoriedTemplate } from "@conformetry/core";
import type { DeepMocked } from "@golevelup/ts-vitest";

const CONFIGURATION_PATH = "configuration/conformetry.config.ts";

/** Discovery reports absolute paths, so the fixtures do too. */
const GEARS_PATH = path.join(
  process.cwd(),
  "packages/widgets/src/modules/gears",
);

const COMMAND_MODULE: InventoriedTemplate = {
  description: "Generate a NestJS command module",
  instances: [
    {
      matchedFileCount: 5,
      matchRatio: 1,
      name: GEARS_PATH,
      templateFileCount: 5,
    },
  ],
  name: "nestjs-command-module",
  templatePath: "configuration/templates/nestjs-command-module",
};

const SERVICE_MODULE: InventoriedTemplate = {
  description: "",
  instances: [
    {
      matchedFileCount: 3,
      matchRatio: 0.6,
      name: GEARS_PATH,
      templateFileCount: 5,
    },
  ],
  name: "nestjs-service-module",
  templatePath: "configuration/templates/nestjs-service-module",
};

/** The same template with its instance paths shortened, as the command emits. */
function withShortenedInstances(
  template: InventoriedTemplate,
): InventoriedTemplate {
  return {
    ...template,
    instances: template.instances.map((instance) => {
      return { ...instance, name: "packages/widgets/src/modules/gears" };
    }),
  };
}

/** Standard output collected during one test. */
const output: string[] = [];

/** Every line the command wrote, joined so a single assertion can span lines. */
const written = (): string => output.join("\n");

/**
 * Dependencies are mocked here; that the real graph wires is proven by
 * `main.integration.test.ts`, which compiles the whole application.
 *
 * The listing renderer is the exception, provided real: it is pure string
 * formatting with no I/O, and mocking it would leave every assertion below
 * checking a stub rather than the output a caller sees.
 */
describe(TemplatesCommand, () => {
  let command: TemplatesCommand;
  let configurationService: DeepMocked<ConfigurationService>;
  let commandLogger: DeepMocked<LoggerService>;

  let readExitCode: ReturnType<typeof captureExitCode>;

  beforeAll(async () => {
    const built = await buildTestingModule(TemplatesCommand, {
      mocks: [ConfigurationService],
      providers: [InventoryService],
    });

    command = built.instance;
    configurationService = built.mock(ConfigurationService);
    commandLogger = built.logger;
  });

  // The shared setup clears every mock before each test, so the return values
  // are re-applied here rather than alongside the module.
  beforeEach(() => {
    readExitCode = captureExitCode();
    output.length = 0;
    vi.spyOn(console, "info").mockImplementation((...data: unknown[]) => {
      output.push(data.map(String).join(" "));
    });
    configurationService.resolveInventoriedTemplates.mockReturnValue([
      COMMAND_MODULE,
      SERVICE_MODULE,
    ]);
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(TemplatesCommand, {
      mocks: [ConfigurationService],
      providers: [InventoryService],
    });

    expect(instance).toBeInstanceOf(TemplatesCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(TemplatesCommand, {
      mocks: [ConfigurationService],
      providers: [InventoryService],
    });
  });

  describe("run", () => {
    it("names every declared template with its description and folder", async () => {
      await command.run([], { config: CONFIGURATION_PATH });
      const lines = written();

      expect(lines).toContain("nestjs-command-module");
      expect(lines).toContain("Generate a NestJS command module");
      expect(lines).toContain("configuration/templates/nestjs-command-module");
    });

    it("names a template that declares no description", async () => {
      await command.run([], { config: CONFIGURATION_PATH });

      expect(written()).toContain("nestjs-service-module");
    });

    // A bare listing is a registry; naming every instance of every template
    // would bury the names somebody actually asked for.
    it("omits instances unless the caller narrowed by path", async () => {
      await command.run([], { config: CONFIGURATION_PATH });

      expect(written()).not.toContain("Instances:");
    });

    it("reports which templates explain a path, and how well", async () => {
      await command.run([], {
        config: CONFIGURATION_PATH,
        instances: [GEARS_PATH],
      });
      const lines = written();

      expect(lines).toContain("Instances:");
      expect(lines).toContain("5/5 files 100%");
      expect(lines).toContain("3/5 files 60%");
    });

    // A path is only readable next to the directory the caller is standing in.
    it("shortens each instance path against the working directory", async () => {
      await command.run([], {
        config: CONFIGURATION_PATH,
        instances: [GEARS_PATH],
      });

      expect(written()).toContain("packages/widgets/src/modules/gears");
      expect(written()).not.toContain(GEARS_PATH);
    });

    // Nothing records where an instance came from, so a path legitimately
    // belongs to more than one template and every one is reported.
    it("reports every template a path belongs to, not just the best fit", async () => {
      await command.run([], {
        config: CONFIGURATION_PATH,
        instances: [GEARS_PATH],
      });
      const lines = written();

      expect(lines).toContain("nestjs-command-module");
      expect(lines).toContain("nestjs-service-module");
    });

    it("passes the path filter through as instance patterns", async () => {
      await command.run([], {
        config: CONFIGURATION_PATH,
        instances: ["packages/*", "tools/*"],
      });

      expect(
        configurationService.resolveInventoriedTemplates,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          instancePatterns: ["packages/*", "tools/*"],
        }),
      );
    });

    it("reads the configuration path the caller named", async () => {
      const scopedConfigurationService = createMock<ConfigurationService>();
      const built = await buildTestingModule(TemplatesCommand, {
        providers: [
          InventoryService,
          {
            provide: ConfigurationService,
            useValue: scopedConfigurationService,
          },
        ],
      });
      const scoped = built.instance;

      await scoped.run([], { config: "custom/conformetry.config.ts" });

      expect(
        scopedConfigurationService.loadConformetryConfiguration,
      ).toHaveBeenCalledWith("custom/conformetry.config.ts");
    });

    it("says so when the configuration declares no templates", async () => {
      configurationService.resolveInventoriedTemplates.mockReturnValue([]);

      await command.run([], { config: CONFIGURATION_PATH });

      expect(written()).toContain("No templates");
    });

    it("distinguishes an unexplained path from an empty configuration", async () => {
      configurationService.resolveInventoriedTemplates.mockReturnValue([]);

      await command.run([], {
        config: CONFIGURATION_PATH,
        instances: ["packages/widgets/nowhere"],
      });

      expect(written()).toContain("No template explains those paths");
    });

    // The shared logger asserts every message opens with an emoji and a verb,
    // which is why the report-printing commands throw outside production.
    it("writes program output without going through the logger", async () => {
      await command.run([], { config: CONFIGURATION_PATH });

      expect(output).not.toHaveLength(0);
      expect(commandLogger.info).not.toHaveBeenCalled();
    });

    it("does not fail the command", async () => {
      await command.run([], { config: CONFIGURATION_PATH });

      expect(readExitCode()).toBeUndefined();
    });

    it("logs a debug entry marker naming the instance filter", async () => {
      await command.run([], {
        config: CONFIGURATION_PATH,
        instances: [GEARS_PATH],
      });

      expect(commandLogger.debug).toHaveBeenCalledWith(
        "📋 Listing conformetry templates",
        undefined,
        { instanceFilter: [GEARS_PATH] },
      );
    });
  });

  describe("machine-readable output", () => {
    // Every path the readable listing shortens is shortened here too, so the
    // two listings name an instance the same way whichever format is read.
    it("writes parseable output carrying every template", async () => {
      await command.run([], { config: CONFIGURATION_PATH, json: true });

      expect(JSON.parse(written())).toStrictEqual([
        withShortenedInstances(COMMAND_MODULE),
        withShortenedInstances(SERVICE_MODULE),
      ]);
    });

    it("writes an empty collection when nothing is declared", async () => {
      configurationService.resolveInventoriedTemplates.mockReturnValue([]);

      await command.run([], { config: CONFIGURATION_PATH, json: true });

      expect(JSON.parse(written())).toStrictEqual([]);
    });
  });

  describe("option parsing", () => {
    it("hands the --config value to the configuration layer's requirement", () => {
      configurationService.requireConfigurationPath.mockReturnValue("a.ts");

      expect(command.parseConfig(" a.ts ")).toBe("a.ts");
      expect(
        configurationService.requireConfigurationPath,
      ).toHaveBeenCalledWith(" a.ts ", "the --config flag");
    });

    it("parses each option through the input service", () => {
      expect(command.parseJson()).toBe(true);
      expect(command.parseConfig("path")).toBeDefined();
      expect(command.parseInstances("a,b")).toBeDefined();
    });
  });
});
