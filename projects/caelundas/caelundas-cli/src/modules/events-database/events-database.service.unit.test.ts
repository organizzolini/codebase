import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { EventsDatabaseService } from "./events-database.service";

describe(EventsDatabaseService, () => {
  let service: EventsDatabaseService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsDatabaseService,
        { provide: ConfigService, useValue: { getOrThrow: () => "" } },
      ],
    }).compile();

    service = await module.resolve(EventsDatabaseService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });
});
