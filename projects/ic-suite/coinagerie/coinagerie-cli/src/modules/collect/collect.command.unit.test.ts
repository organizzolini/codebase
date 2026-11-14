import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { ConfigurationModule } from "@coinagerie/configuration";
import {
  ComparisonModule,
  DeliveryModule,
  JsonModule,
  MarkdownModule,
} from "@coinagerie/output";
import { VocabularyModule, VocabularyService } from "@coinagerie/vocabulary";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import {
  captureExitCode,
  captureOutput,
  createFileTree,
  useWorkingDirectory,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CollectCommand } from "./collect.command";

import type { CollectCommandOptions } from "./collect.types";
import type {
  BuiltTestingModule,
  TestingModuleOptions,
} from "@codebase/testing/nestjs";

/** The real layers the command composes; only the logger is replaced. */
const DEPENDENCIES = {
  imports: [
    ComparisonModule,
    ConfigurationModule,
    DeliveryModule,
    JsonModule,
    MarkdownModule,
    VocabularyModule,
  ],
} satisfies TestingModuleOptions;

const CONFIGURATION = {
  "coinagerie.config.ts": [
    "export default {",
    '  exclude: { paths: ["coinagerie.config.ts", "tsconfig.json"] },',
    '  outputs: [{ path: "GLOSSARY.md", type: "markdown" }],',
    "};",
    "",
  ].join("\n"),
};
const START_ANCHOR = "<!-- coinagerie:start -->";
const SOURCE = { "main.ts": "const answerValue = 1;\n" };

describe(CollectCommand, () => {
  let command: CollectCommand;
  let logger: BuiltTestingModule<CollectCommand>["logger"];
  let readExitCode: () => typeof process.exitCode;

  beforeAll(async () => {
    ({ instance: command, logger } = await buildTestingModule(
      CollectCommand,
      DEPENDENCIES,
    ));
  });

  beforeEach(() => {
    readExitCode = captureExitCode();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Runs the command in-process with a repository fixture as its working directory. */
  async function runIn(
    files: Record<string, string>,
    options: CollectCommandOptions,
  ): Promise<string> {
    const fixture = createFileTree(files, { git: true, label: "collect" });
    useWorkingDirectory(fixture);
    await command.run([], options);
    return fixture;
  }

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(CollectCommand, DEPENDENCIES);

    expect(instance).toBeInstanceOf(CollectCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(CollectCommand, DEPENDENCIES);
  });

  it("reads its flags", () => {
    expect(command.parseCheck()).toBe(true);
    expect(command.parseWrite()).toBe(true);
    expect(command.parseConfig("custom.config.ts")).toBe("custom.config.ts");
    expect(command.parseDescription("Words.")).toBe("Words.");
    expect(command.parseFormat("json")).toBe("json");
    expect(command.parseOutputJson("a.json")).toBe("a.json");
    expect(command.parseOutputMarkdown("A.md")).toBe("A.md");
  });

  it.each<[string, (value: string, previous?: string[]) => string[]]>([
    ["--include", (value, previous) => command.parseInclude(value, previous)],
    [
      "--exclude-paths",
      (value, previous) => command.parseExcludePaths(value, previous),
    ],
  ])("collects every occurrence of %s", (_flag, parse) => {
    expect(parse("b", parse("a"))).toStrictEqual(["a", "b"]);
  });

  it("prints the glossary block when given no flag", async () => {
    const output = captureOutput();

    await runIn({ ...CONFIGURATION, ...SOURCE }, {});

    expect(output.stdout()).toContain(
      "- **answer**:\n- **main**:\n- **value**:",
    );
    expect(readExitCode()).toBeUndefined();
  });

  it("prints the glossary as flat json when --format json asks", async () => {
    const output = captureOutput();

    await runIn({ ...CONFIGURATION, ...SOURCE }, { format: "json" });

    const printed = output.stdout();

    expect(printed.startsWith('{\n  "answer": "",\n  "main": "",')).toBe(true);
    expect(printed.endsWith("\n}\n")).toBe(true);
    expect(printed).not.toContain(START_ANCHOR);
  });

  it("lets flags name the destinations the file does not", async () => {
    const fixture = await runIn(SOURCE, {
      outputJson: "words.json",
      outputMarkdown: "WORDS.md",
      write: true,
    });

    expect(
      JSON.parse(readFileSync(path.join(fixture, "words.json"), "utf8")),
    ).toMatchObject({ answer: "", main: "", value: "" });
    expect(readFileSync(path.join(fixture, "WORDS.md"), "utf8")).toContain(
      "- **answer**:",
    );
  });

  it("lets flags narrow the scan the file configured", async () => {
    const fixture = await runIn(
      { ...CONFIGURATION, ...SOURCE, "other.ts": "const strayName = 1;\n" },
      { include: ["main.ts"], write: true },
    );

    expect(
      readFileSync(path.join(fixture, "GLOSSARY.md"), "utf8"),
    ).not.toContain("stray");
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

    expect(readExitCode()).toBeUndefined();
  });

  it.each<[string, Record<string, string>, CollectCommandOptions]>([
    [
      "a check against a glossary that is missing words",
      CONFIGURATION,
      { check: true },
    ],
    ["both --check and --write", CONFIGURATION, { check: true, write: true }],
    ["a check with no destination configured", {}, { check: true }],
    ["a format it does not know", {}, { format: "yaml" }],
    ["a flag the configuration refuses", {}, { outputJson: "" }],
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

    expect(readExitCode()).toBe(1);
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

      expect(readExitCode()).toBe(1);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("🪙"),
        undefined,
        expect.objectContaining<{ reason: string }>({
          reason: expect.stringContaining(
            path.join(fixture, "coinagerie.config.ts"),
          ),
        }),
      );
      expect(existsSync(path.join(fixture, "GLOSSARY.md"))).toBe(false);
    },
  );
});
