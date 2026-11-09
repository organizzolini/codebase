import { DiscoveryModule, DiscoveryService } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

import { expectModuleExports } from "@codebase/testing/nestjs";

import { CharacteristicsModule } from "../characteristics.module";

import { ConnectivityModule } from "./connectivity.module";
import { ConnectivityService } from "./connectivity.service";

/** The token a consumer module gathers the shared service under, through a factory whose `inject` list only resolves exported providers. */
const SHARED = Symbol("SHARED");

describe(ConnectivityModule, () => {
  it("exports ConnectivityService", () => {
    expectModuleExports(ConnectivityModule, ConnectivityService);
  });

  it("lets a consumer that imports the module inject ConnectivityService", async () => {
    const module = await Test.createTestingModule({
      imports: [ConnectivityModule],
      providers: [
        {
          inject: [ConnectivityService],
          provide: SHARED,
          useFactory: (service: ConnectivityService): ConnectivityService =>
            service,
        },
      ],
    }).compile();

    expect(module.get(SHARED)).toBeInstanceOf(ConnectivityService);
  });

  it("is the only provider of ConnectivityService across CharacteristicsModule", async () => {
    const module = await Test.createTestingModule({
      imports: [CharacteristicsModule, DiscoveryModule],
    }).compile();
    const providers: readonly { readonly instance: unknown }[] = module
      .get(DiscoveryService)
      .getProviders();

    expect(
      providers.filter(
        ({ instance }) => instance instanceof ConnectivityService,
      ),
    ).toHaveLength(1);
  });
});
