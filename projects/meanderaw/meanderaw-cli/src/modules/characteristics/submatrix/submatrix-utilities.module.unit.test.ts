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

import { SubmatrixUtilitiesModule } from "./submatrix-utilities.module";
import { SubmatrixUtilitiesService } from "./submatrix-utilities.service";

/** A consumer module's provider that injects the shared service, which only resolves when the module exports it. */
@Injectable()
class Consumer {
  constructor(readonly service: SubmatrixUtilitiesService) {}
}

describe(SubmatrixUtilitiesModule, () => {
  it("exports SubmatrixUtilitiesService", () => {
    expectModuleExports(SubmatrixUtilitiesModule, SubmatrixUtilitiesService);
  });

  it("lets a consumer that imports the module inject SubmatrixUtilitiesService", async () => {
    const { instance } = await buildTestingModule(Consumer, {
      imports: [SubmatrixUtilitiesModule],
    });

    expect(instance.service).toBeInstanceOf(SubmatrixUtilitiesService);
  });

  it("is the only provider of SubmatrixUtilitiesService across CharacteristicsModule", async () => {
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
        ({ instance }) => instance instanceof SubmatrixUtilitiesService,
      ),
    ).toHaveLength(1);
  });
});
