import { describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeanderCharacteristicsLoader } from "./meander-characteristics.loader";
import { MeanderCharacteristicsResolver } from "./meander-characteristics.resolver";

describe(MeanderCharacteristicsResolver, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      MeanderCharacteristicsResolver,
      { mocks: [MeanderCharacteristicsLoader] },
    );

    expect(instance).toBeInstanceOf(MeanderCharacteristicsResolver);
  });

  it("loads the values held by the meander it resolves", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      MeanderCharacteristicsResolver,
      {
        providers: [
          {
            provide: MeanderCharacteristicsLoader,
            useValue: {
              byMeanderId: {
                load: vi.fn().mockResolvedValue([
                  {
                    isPattern: true,
                    key: "isChain",
                    name: "Chain",
                    value: 1,
                  },
                ]),
              },
            },
          },
        ],
      },
    );
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

    await expect(instance.characteristics(meander)).resolves.toStrictEqual([
      { isPattern: true, key: "isChain", name: "Chain", value: 1 },
    ]);
  });
});
