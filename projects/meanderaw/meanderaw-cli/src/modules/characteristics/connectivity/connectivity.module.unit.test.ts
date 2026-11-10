import { Injectable } from "@nestjs/common";
import { DiscoveryModule, DiscoveryService } from "@nestjs/core";
import { describe, expect, it } from "vitest";

import {
  buildTestingModule,
  expectModuleExports,
} from "@codebase/testing/nestjs";

import { CodeModule } from "../../code/code.module";
import { MatrixModule } from "../../matrix/matrix.module";
import { CharacteristicContextService } from "../characteristic-context.service";
import { CharacteristicsModule } from "../characteristics.module";

import { ConnectivityModule } from "./connectivity.module";
import { ConnectivityService } from "./connectivity.service";

/** A consumer module's provider that injects the shared service, which only resolves when the module exports it. */
@Injectable()
class Consumer {
  constructor(readonly service: ConnectivityService) {}
}

describe(ConnectivityModule, () => {
  it("exports ConnectivityService", () => {
    expectModuleExports(ConnectivityModule, ConnectivityService);
  });

  it("lets a consumer that imports the module inject ConnectivityService", async () => {
    const { instance } = await buildTestingModule(Consumer, {
      imports: [ConnectivityModule],
    });

    expect(instance.service).toBeInstanceOf(ConnectivityService);
  });

  it("is the only provider of ConnectivityService across CharacteristicsModule", async () => {
    const { module } = await buildTestingModule(CharacteristicContextService, {
      imports: [
        CodeModule,
        MatrixModule,
        CharacteristicsModule,
        DiscoveryModule,
      ],
    });
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
