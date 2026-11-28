import { describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { MetricExpressionsCommand } from "./metric-expressions.command";
import { MetricExpressionsOptionError } from "./metric-expressions.constants";
import { MetricExpressionsService } from "./metric-expressions.service";

const TESTING_MODULE_OPTIONS = { mocks: [MetricExpressionsService] };

describe(MetricExpressionsCommand, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      MetricExpressionsCommand,
      TESTING_MODULE_OPTIONS,
    );

    expect(instance).toBeInstanceOf(MetricExpressionsCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(MetricExpressionsCommand, TESTING_MODULE_OPTIONS);
  });

  it("writes the file named by --output-markdown", async () => {
    const { instance, mock } = await buildTestingModule(
      MetricExpressionsCommand,
      TESTING_MODULE_OPTIONS,
    );

    await instance.run([], { outputMarkdown: "metric-expressions.md" });

    expect(mock(MetricExpressionsService).sync).toHaveBeenCalledExactlyOnceWith(
      { check: false, outputMarkdown: "metric-expressions.md" },
    );
  });

  it("checks without writing under --check", async () => {
    const { instance, mock } = await buildTestingModule(
      MetricExpressionsCommand,
      TESTING_MODULE_OPTIONS,
    );

    await instance.run([], { check: true, outputMarkdown: "a.md" });

    expect(mock(MetricExpressionsService).sync).toHaveBeenCalledExactlyOnceWith(
      { check: true, outputMarkdown: "a.md" },
    );
  });

  it("requires --output-markdown", async () => {
    const { instance } = await buildTestingModule(
      MetricExpressionsCommand,
      TESTING_MODULE_OPTIONS,
    );

    await expect(instance.run([], {})).rejects.toThrow(
      MetricExpressionsOptionError,
    );
  });

  it("parses its two options", async () => {
    const { instance } = await buildTestingModule(
      MetricExpressionsCommand,
      TESTING_MODULE_OPTIONS,
    );

    expect(instance.parseCheck()).toBe(true);
    expect(instance.parseOutputMarkdown("a.md")).toBe("a.md");
  });
});
