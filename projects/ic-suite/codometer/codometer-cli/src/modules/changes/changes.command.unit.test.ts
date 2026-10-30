import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ConfigurationModule as CodometerConfigurationModule } from "@codometer/configuration";
import {
  ChangesService,
  DocumentsService,
  RenderService,
} from "@codometer/output";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { captureOutput, createTemporaryDirectory } from "@codebase/testing";
import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { ChangesCommand } from "./changes.command";

import type { LoggerService } from "@codebase/observability";
import type { MetricCollection, MetricRow } from "@codometer/output";
import type { DeepMocked } from "@golevelup/ts-vitest";

const row: MetricRow = {
  baseValue: undefined,
  breach: undefined,
  empty: false,
  label: "Compiled JavaScript",
  limit: 2000,
  measured: true,
  name: "Compiled JavaScript.size",
  project: "logger",
  removed: false,
  unit: "bytes",
  value: 1000,
};

describe(ChangesCommand, () => {
  let command: ChangesCommand;
  let logger: DeepMocked<LoggerService>;
  const collect = vi.fn<() => MetricCollection>(() => ({
    failures: [],
    rows: [row],
  }));

  beforeAll(async () => {
    const { instance, logger: loggerMock } = await buildTestingModule(
      ChangesCommand,
      {
        imports: [CodometerConfigurationModule],
        providers: [
          DocumentsService,
          RenderService,
          { provide: ChangesService, useValue: { collect } },
        ],
      },
    );

    command = instance;
    logger = loggerMock;
  });

  afterEach(() => {
    collect.mockClear();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(ChangesCommand, {
      imports: [CodometerConfigurationModule],
      providers: [
        DocumentsService,
        RenderService,
        { provide: ChangesService, useValue: { collect } },
      ],
    });

    expect(instance).toBeInstanceOf(ChangesCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(ChangesCommand, {
      imports: [CodometerConfigurationModule],
      providers: [
        DocumentsService,
        RenderService,
        { provide: ChangesService, useValue: { collect } },
      ],
    });
  });

  it.each([
    { flag: "--baseline", parse: "parseBaseline" },
    { flag: "--baseline-url", parse: "parseBaselineUrl" },
    { flag: "--markdown", parse: "parseMarkdown" },
    { flag: "--output", parse: "parseOutput" },
  ] as const)("reads $flag, treating an empty value as absent", ({ parse }) => {
    expect(command[parse]("value")).toBe("value");
    expect(command[parse]("")).toBeUndefined();
    expect(command[parse](undefined)).toBeUndefined();
    // An empty shell variable reaches commander as a valueless flag, which it
    // reports as `true`; rendering that would link to the word "true".
    expect(command[parse](true)).toBeUndefined();
  });

  it("defaults the directory to the process working directory", () => {
    expect(command.parseDirectory("/some/directory")).toBe("/some/directory");
    expect(command.parseDirectory(undefined)).toBe(process.cwd());
  });

  it("prints the section when given no destination", async () => {
    const output = captureOutput();

    await command.run([], {});

    expect(output.stdout()).toContain("## ⏲️ Codometer");
  });

  it("ignores a valueless baseline URL rather than rendering it as text", async () => {
    const output = path.join(
      createTemporaryDirectory("codometer-changes-"),
      "section.md",
    );

    // Commander reports `--baseline-url` with no value as `true`, without
    // calling the option's parser.
    await command.run([], { baselineUrl: true, output });

    const written = readFileSync(output, "utf8");

    expect(written).not.toContain("(true)");
  });

  it("logs how many rows and failures it collected", async () => {
    await command.run([], {});

    expect(logger.info).toHaveBeenCalledWith(
      "⏲️ Collected the codometer change report",
      undefined,
      { failures: 0, rows: 1 },
    );
  });

  it("writes the section alone to an output file", async () => {
    const output = path.join(
      createTemporaryDirectory("codometer-changes-"),
      "section.md",
    );

    await command.run([], { output });

    const written = readFileSync(output, "utf8");

    expect(written).toContain("<!-- codometer-changes:start -->");
    expect(written).toContain("`logger`");
  });

  it("splices the section into a markdown file, keeping its prose", async () => {
    const markdown = path.join(
      createTemporaryDirectory("codometer-changes-"),
      "description.md",
    );
    writeFileSync(markdown, "## 🌰 Summary\n\nProse.\n", "utf8");

    await command.run([], { markdown });

    const written = readFileSync(markdown, "utf8");

    expect(written).toContain("## 🌰 Summary");
    expect(written.indexOf("## 🌰 Summary")).toBeLessThan(
      written.indexOf("## ⏲️ Codometer"),
    );
  });

  it("replaces the section rather than appending on a second run", async () => {
    const markdown = path.join(
      createTemporaryDirectory("codometer-changes-"),
      "description.md",
    );
    writeFileSync(markdown, "## 🌰 Summary\n", "utf8");

    await command.run([], { markdown });
    await command.run([], { markdown });

    const written = readFileSync(markdown, "utf8");

    expect(written.split("<!-- codometer-changes:start -->")).toHaveLength(2);
  });

  it("passes the baseline through to collection", async () => {
    await command.run([], {
      baseline: ".baseline",
      output: path.join(
        createTemporaryDirectory("codometer-changes-"),
        "section.md",
      ),
    });

    expect(collect).toHaveBeenCalledWith({
      baselineDirectory: ".baseline",
      workingDirectory: process.cwd(),
    });
  });

  it("threads the baseline url into the rendered comparison", async () => {
    const output = path.join(
      createTemporaryDirectory("codometer-changes-"),
      "section.md",
    );

    await command.run([], {
      baselineUrl: "https://example.test/actions/runs/1",
      output,
    });

    expect(readFileSync(output, "utf8")).toContain(
      "https://example.test/actions/runs/1",
    );
  });
});
