import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ReporterService } from "./reporter.service";

describe(ReporterService, () => {
  let service: ReporterService;

  beforeAll(async () => {
    const { module } = await buildTestingModule(ReporterService);

    service = await module.resolve(ReporterService);
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(ReporterService);

    expect(instance).toBeInstanceOf(ReporterService);
  });

  it("prints a line to the terminal", () => {
    expect.hasAssertions();

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    service.print("✅ done");

    expect(info).toHaveBeenCalledWith("✅ done");
  });
});
