import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeandersResolver } from "./meanders.resolver";
import { MeandersService } from "./meanders.service";

describe(MeandersResolver, () => {
  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(MeandersResolver, {
      mocks: [MeandersService],
    });

    expect(instance).toBeInstanceOf(MeandersResolver);
  });

  it("hands its arguments to the service and returns the page", async () => {
    expect.hasAssertions();

    const { instance, mock } = await buildTestingModule(MeandersResolver, {
      mocks: [MeandersService],
    });
    const page = { edges: [], totalCount: 0 };
    mock(MeandersService).find.mockResolvedValue(page as never);

    await expect(
      instance.meanders({
        after: "c",
        first: 5,
        sort: { direction: "ASC", field: "rows" },
      } as never),
    ).resolves.toBe(page);
    expect(mock(MeandersService).find).toHaveBeenCalledWith({
      after: "c",
      filter: undefined,
      first: 5,
      sort: { direction: "ASC", field: "rows" },
    });
  });

  it("draws the meander the service is asked to", async () => {
    expect.hasAssertions();

    const { instance, mock } = await buildTestingModule(MeandersResolver, {
      mocks: [MeandersService],
    });
    const meander = {
      code: "01",
      columns: 2,
      id: "i",
      isHardcoded: true,
      lattice: "0",
      repeats: 1,
      rows: 1,
      symmetricalCodes: [],
    };
    mock(MeandersService).draw.mockReturnValue("<svg/>");

    expect(instance.svg(meander, 6)).toBe("<svg/>");
    expect(mock(MeandersService).draw).toHaveBeenCalledWith(meander, 6);
  });
});
