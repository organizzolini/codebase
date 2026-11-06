import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";

import type { EventsDatasetEntity } from "./events.entities";

const describeDataset = vi.fn<() => Promise<EventsDatasetEntity | null>>();

describe(EventsResolver, () => {
  let resolver: EventsResolver;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsResolver,
        { provide: EventsService, useValue: { describeDataset } },
      ],
    }).compile();

    resolver = await module.resolve(EventsResolver);
  });

  it("is defined", () => {
    expect(resolver).toBeDefined();
  });

  it("answers the dataset query with the service's description", async () => {
    expect.hasAssertions();

    const dataset = {
      count: 2,
      end: new Date("2026-03-02T00:00:00Z"),
      start: new Date("2026-03-01T00:00:00Z"),
      timezone: "America/New_York",
    };

    describeDataset.mockResolvedValueOnce(dataset);

    await expect(resolver.dataset()).resolves.toBe(dataset);
  });
});
