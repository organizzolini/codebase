import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { TagCodebaseService } from "./tag-codebase.service";

describe(TagCodebaseService, () => {
  const moduleOptions = { mocks: [MainTipService, ProcessRunnerService] };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      TagCodebaseService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(TagCodebaseService);
  });
});
