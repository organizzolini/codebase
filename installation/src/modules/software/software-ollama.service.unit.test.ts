import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import { SoftwareOllamaService } from "./software-ollama.service";

describe(SoftwareOllamaService, () => {
  const moduleOptions = {
    mocks: [ProcessRunnerService, SoftwareBrewService, ReporterService],
  };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SoftwareOllamaService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SoftwareOllamaService);
  });
});
