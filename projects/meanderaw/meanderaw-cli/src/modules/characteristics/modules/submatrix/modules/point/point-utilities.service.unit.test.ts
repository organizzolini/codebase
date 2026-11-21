import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { PointUtilitiesService } from "./point-utilities.service";

describe(PointUtilitiesService, () => {
  let service: PointUtilitiesService;

  beforeAll(async () => {
    const built = await buildTestingModule(PointUtilitiesService);

    service = built.instance;
  });

  it.each([
    {
      expected: 0,
      point: { east: false, north: false, south: false, west: false },
    },
    {
      expected: 1,
      point: { east: false, north: false, south: true, west: false },
    },
    {
      expected: 2,
      point: { east: true, north: false, south: false, west: true },
    },
    {
      expected: 3,
      point: { east: true, north: false, south: true, west: true },
    },
    {
      expected: 4,
      point: { east: true, north: true, south: true, west: true },
    },
  ])("counts $expected arms for $point", ({ expected, point }) => {
    expect(service.armCount(point)).toBe(expected);
  });
});
