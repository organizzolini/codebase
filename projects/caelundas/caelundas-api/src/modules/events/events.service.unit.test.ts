import { Test } from "@nestjs/testing";
import { getEntityManagerToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { EventsService } from "./events.service";

import type { EntityManager } from "typeorm";

const query = vi.fn<EntityManager["query"]>();

describe(EventsService, () => {
  let service: EventsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getEntityManagerToken(), useValue: { query } },
      ],
    }).compile();

    service = await module.resolve(EventsService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("runs the statement with its parameters and parses each row", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([{ count: "3" }, { count: "4" }]);

    await expect(
      service.select("select 1", [7], z.object({ count: z.coerce.number() })),
    ).resolves.toStrictEqual([{ count: 3 }, { count: 4 }]);
    expect(query).toHaveBeenCalledWith("select 1", [7]);
  });

  it("describes the dataset from its single row", async () => {
    expect.hasAssertions();

    const start = new Date("2026-03-01T00:00:00Z");
    const end = new Date("2026-03-02T00:00:00Z");

    query.mockResolvedValueOnce([
      { count: "2", end, start, timezone: "America/New_York" },
    ]);

    await expect(service.describeDataset()).resolves.toStrictEqual({
      count: 2,
      end,
      start,
      timezone: "America/New_York",
    });
  });

  it("describes an empty dataset as null", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([]);

    await expect(service.describeDataset()).resolves.toBeNull();
  });

  it("refuses a row that does not match the schema", async () => {
    expect.hasAssertions();

    query.mockResolvedValueOnce([{ count: "many" }]);

    await expect(
      service.select("select 1", [], z.object({ count: z.coerce.number() })),
    ).rejects.toThrow(z.ZodError);
  });
});
