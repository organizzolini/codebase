import { DiscoveryModule, DiscoveryService } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

import { expectModuleExports } from "@codebase/testing/nestjs";

import { CharacteristicsModule } from "../characteristics.module";

import { CompoundUtilitiesModule } from "./compound-utilities.module";
import { CompoundUtilitiesService } from "./compound-utilities.service";

describe(CompoundUtilitiesModule, () => {
  it("exports CompoundUtilitiesService", () => {
    expectModuleExports(CompoundUtilitiesModule, CompoundUtilitiesService);
  });

  it("is the only provider of CompoundUtilitiesService across CharacteristicsModule", async () => {
    const module = await Test.createTestingModule({
      imports: [CharacteristicsModule, DiscoveryModule],
    }).compile();
    const providers: readonly { readonly instance: unknown }[] = module
      .get(DiscoveryService)
      .getProviders();

    expect(
      providers.filter(
        ({ instance }) => instance instanceof CompoundUtilitiesService,
      ),
    ).toHaveLength(1);
  });
});
