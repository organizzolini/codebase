import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { TagCodebaseService } from "./tag-codebase.service";

describe(TagCodebaseService, () => {
  let service: TagCodebaseService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TagCodebaseService,
        { provide: MainTipService, useValue: createMock<MainTipService>() },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
      ],
    }).compile();

    service = await module.resolve(TagCodebaseService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
