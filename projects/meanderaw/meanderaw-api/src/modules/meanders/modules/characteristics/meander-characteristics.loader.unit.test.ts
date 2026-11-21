import { describe, expect, it, vi } from "vitest";

import { MeanderCharacteristicsLoader } from "./meander-characteristics.loader";

import type { MeandersService } from "../../meanders.service";

describe(MeanderCharacteristicsLoader, () => {
  it("batches the loads of one tick into one read, answering in request order", async () => {
    expect.hasAssertions();

    const findCharacteristicsFor = vi
      .fn<MeandersService["findCharacteristicsFor"]>()
      .mockResolvedValue([
        [{ isPattern: true, key: "isChain", name: "Chain", value: 1 }],
        [],
      ]);
    const loader = new MeanderCharacteristicsLoader({
      findCharacteristicsFor,
    } as unknown as MeandersService);

    const values = await Promise.all([
      loader.byMeanderId.load("a"),
      loader.byMeanderId.load("b"),
    ]);

    expect(values).toStrictEqual([
      [{ isPattern: true, key: "isChain", name: "Chain", value: 1 }],
      [],
    ]);
    expect(findCharacteristicsFor).toHaveBeenCalledTimes(1);
    expect(findCharacteristicsFor).toHaveBeenCalledWith(["a", "b"]);
  });
});
