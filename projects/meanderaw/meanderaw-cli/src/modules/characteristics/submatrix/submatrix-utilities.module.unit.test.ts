import { DiscoveryModule, DiscoveryService } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

import { expectModuleExports } from "@codebase/testing/nestjs";

import { CharacteristicsModule } from "../characteristics.module";

import { SubmatrixUtilitiesModule } from "./submatrix-utilities.module";
import { SubmatrixUtilitiesService } from "./submatrix-utilities.service";

describe(SubmatrixUtilitiesModule, () => {
  it("exports SubmatrixUtilitiesService", () => {
    expectModuleExports(SubmatrixUtilitiesModule, SubmatrixUtilitiesService);
  });

  it("is the only provider of SubmatrixUtilitiesService across CharacteristicsModule", async () => {
    const module = await Test.createTestingModule({
      imports: [CharacteristicsModule, DiscoveryModule],
    }).compile();
    const providers: readonly { readonly instance: unknown }[] = module
      .get(DiscoveryService)
      .getProviders();

    expect(
      providers.filter(
        ({ instance }) => instance instanceof SubmatrixUtilitiesService,
      ),
    ).toHaveLength(1);
  });
});
