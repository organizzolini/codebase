import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/logging";

import { ReporterService } from "./reporter.service";

describe(ReporterService, () => {
  let service: ReporterService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReporterService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(ReporterService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("prints a line to the terminal", () => {
    expect.hasAssertions();

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    service.print("✅ done");

    expect(info).toHaveBeenCalledWith("✅ done");
  });
});
