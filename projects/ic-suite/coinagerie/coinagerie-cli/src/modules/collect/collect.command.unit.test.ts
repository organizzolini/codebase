import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { ConfigurationModule } from "@coinagerie/configuration";
import {
  ComparisonModule,
  DeliveryModule,
  MarkdownModule,
} from "@coinagerie/output";
import { VocabularyModule, VocabularyService } from "@coinagerie/vocabulary";
import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import {
  createFixtureTree,
  removeFixtureTree,
} from "../../../testing/fixture-tree";

import { CollectCommand } from "./collect.command";

import type { CollectCommandOptions } from "./collect.types";

/** The real layers the command composes; only the logger is replaced. */
const COLLECT_DEPENDENCIES = [
  ComparisonModule,
  ConfigurationModule,
  DeliveryModule,
  MarkdownModule,
  VocabularyModule,
];

const CONFIGURATION = {
  "coinagerie.config.ts": [
    "export default {",
    '  exclude: { paths: ["coinagerie.config.ts", "tsconfig.json"] },',
    '  outputs: [{ path: "GLOSSARY.md", type: "markdown" }],',
    "};",
    "",
  ].join("\n"),
};
const SOURCE = { "main.ts": "const answerValue = 1;\n" };

describe(CollectCommand, () => {
  let command: CollectCommand;
  let logger: LoggerService;
  let root: string | undefined;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: COLLECT_DEPENDENCIES,
      providers: [
        CollectCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(CollectCommand);
    logger = await module.resolve(LoggerService);
  });

  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();

    if (root !== undefined) {
      removeFixtureTree(root);
      root = undefined;
    }
  });

  /** Runs the command in-process with a fixture tree as its working directory. */
  async function runIn(
    files: Record<string, string>,
    options: CollectCommandOptions,
  ): Promise<string> {
    const fixture = createFixtureTree(files);
    root = fixture;
    vi.spyOn(process, "cwd").mockReturnValue(fixture);
    await command.run([], options);
    return fixture;
  }

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      imports: COLLECT_DEPENDENCIES,
      providers: [
        CollectCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("CollectCommand");
  });

  it("reads its flags", () => {
    expect(command.parseCheck()).toBe(true);
    expect(command.parseWrite()).toBe(true);
    expect(command.parseConfig("custom.config.ts")).toBe("custom.config.ts");
  });

  it("prints the glossary block when given no flag", async () => {
    const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    await runIn(SOURCE, {});

    expect(write).toHaveBeenCalledWith(
      expect.stringContaining("- **answer**:\n- **main**:"),
    );
    expect(process.exitCode).toBeUndefined();
  });

  it("writes every destination, then checks clean", async () => {
    const fixture = await runIn(
      { ...CONFIGURATION, ...SOURCE },
      { write: true },
    );

    expect(readFileSync(path.join(fixture, "GLOSSARY.md"), "utf8")).toContain(
      "- **answer**:\n- **main**:\n- **value**:",
    );

    await command.run([], { check: true });

    expect(process.exitCode).toBeUndefined();
  });

  it.each<[string, Record<string, string>, CollectCommandOptions]>([
    [
      "a check against a glossary that is missing words",
      CONFIGURATION,
      { check: true },
    ],
    ["both --check and --write", CONFIGURATION, { check: true, write: true }],
    ["a check with no destination configured", {}, { check: true }],
    [
      "a configuration file that is not there",
      {},
      { check: true, config: "missing.config.ts" },
    ],
    [
      "a glossary it cannot parse",
      {
        ...CONFIGURATION,
        "GLOSSARY.md":
          "<!-- coinagerie:start -->\n- **main**:\nstray\n<!-- coinagerie:end -->\n",
      },
      { write: true },
    ],
  ])("fails %s", async (_case, files, options) => {
    await runIn({ ...files, ...SOURCE }, options);

    expect(process.exitCode).toBe(1);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("🪙"),
      undefined,
      expect.any(Object),
    );
  });

  it("lets an error that is not a parse failure escape", async () => {
    await expect(
      runIn(
        {
          ...SOURCE,
          "coinagerie.config.ts":
            'export default { outputs: [{ path: "folder", type: "markdown" }] };\n',
          "folder/inside.md": "",
        },
        { check: true },
      ),
    ).rejects.toThrow("EISDIR");
  });

  it("lets a failure that is not a configuration fault escape while collecting", async () => {
    vi.spyOn(VocabularyService.prototype, "collect").mockRejectedValue(
      new Error("disk gone"),
    );

    await expect(runIn(SOURCE, {})).rejects.toThrow("disk gone");
  });

  it.each([
    [
      "an exclude.words that throws",
      "exclude: { paths: [], words: () => { throw new Error('unreadable'); } }",
    ],
    ["a fold that returns nothing useful", "fold: () => ''"],
  ])(
    "aborts on %s, naming the configuration file and writing nothing",
    async (_case, field) => {
      const fixture = await runIn(
        {
          ...SOURCE,
          "coinagerie.config.ts": [
            "export default {",
            `  ${field},`,
            '  outputs: [{ path: "GLOSSARY.md", type: "markdown" }],',
            "};",
            "",
          ].join("\n"),
        },
        { write: true },
      );

      expect(process.exitCode).toBe(1);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("🪙"),
        undefined,
        expect.any(Object),
      );
      expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).toContain(
        path.join(fixture, "coinagerie.config.ts"),
      );
      expect(existsSync(path.join(fixture, "GLOSSARY.md"))).toBe(false);
    },
  );
});
