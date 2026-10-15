import { Test } from "@nestjs/testing";
import { CommandFactory } from "nest-commander";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { MainModule } from "./conformetry-cli.module";
import { GenerateCommand } from "./modules/generate/generate.command";
import { InstancesCommand } from "./modules/instances/instances.command";
import { TemplatesCommand } from "./modules/templates/templates.command";
import { ValidateCommand } from "./modules/validate/validate.command";

import type { TestingModule } from "@nestjs/testing";

/**
 * Boots the real module graph rather than mocking the packages.
 *
 * Mocked module stubs cannot catch the failure that matters here: a command
 * whose dependencies resolve to `undefined` still constructs fine and only
 * fails when a method is called. Compiling the actual graph is what proves
 * the wiring.
 */
describe(MainModule, () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [MainModule],
    }).compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it("compiles the whole application graph", () => {
    expect(module).toBeDefined();
  });

  it("resolves the generate command with every dependency injected", async () => {
    const command = await module.resolve(GenerateCommand);

    expect(command).toBeDefined();
    expect(command.parseTemplate("example")).toBe("example");
  });

  it("resolves the instances command with every dependency injected", async () => {
    const command = await module.resolve(InstancesCommand);

    expect(command).toBeDefined();
    expect(command.parseTemplates("react-component")).toStrictEqual([
      "react-component",
    ]);
  });

  it("resolves the templates command with every dependency injected", async () => {
    const command = await module.resolve(TemplatesCommand);

    expect(command).toBeDefined();
    expect(command.parseInstances("packages/*")).toStrictEqual(["packages/*"]);
  });

  it("resolves the validate command with every dependency injected", async () => {
    const command = await module.resolve(ValidateCommand);

    expect(command).toBeDefined();
    expect(command.parseLanguages("typescript")).toStrictEqual(["typescript"]);
  });

  describe("the required --config option", () => {
    const originalArguments = process.argv;

    afterEach(() => {
      process.argv = originalArguments;
      vi.restoreAllMocks();
    });

    it.each(["generate", "instances", "templates", "validate"])(
      "refuses `%s` when --config is omitted",
      async (commandName) => {
        const writes: string[] = [];

        vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
          writes.push(String(chunk));

          return true;
        });
        // Commander ends a refused command line with `process.exit(1)`, which
        // Vitest turns into a throw that `CommandFactory` reports on stderr.
        process.argv = ["node", "conformetry", commandName];

        await CommandFactory.run(MainModule, { logger: false });

        expect(writes).toContain(
          "error: required option '--config <path>' not specified\n",
        );
      },
    );

    it("refuses a blank --config in the configuration layer's words", async () => {
      const writes: string[] = [];

      vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
        writes.push(String(chunk));

        return true;
      });
      process.argv = ["node", "conformetry", "templates", "--config", " "];

      await CommandFactory.run(MainModule, { logger: false });

      expect(writes.join("")).toContain(
        "A conformetry configuration path is required, but the --config flag is missing or blank.",
      );
    });
  });
});
