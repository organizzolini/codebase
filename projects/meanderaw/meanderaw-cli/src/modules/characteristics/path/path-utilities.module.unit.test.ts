import { DiscoveryModule, DiscoveryService } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

import { expectModuleExports } from "@codebase/testing/nestjs";

import { CharacteristicsModule } from "../characteristics.module";

import { PathUtilitiesModule } from "./path-utilities.module";
import { PathUtilitiesService } from "./path-utilities.service";

describe(PathUtilitiesModule, () => {
  it("exports PathUtilitiesService", () => {
    expectModuleExports(PathUtilitiesModule, PathUtilitiesService);
  });

  it("is the only provider of PathUtilitiesService across CharacteristicsModule", async () => {
    const module = await Test.createTestingModule({
      imports: [CharacteristicsModule, DiscoveryModule],
    }).compile();
    const providers: readonly { readonly instance: unknown }[] = module
      .get(DiscoveryService)
      .getProviders();

    expect(
      providers.filter(
        ({ instance }) => instance instanceof PathUtilitiesService,
      ),
    ).toHaveLength(1);
  });
});
