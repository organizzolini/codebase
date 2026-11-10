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

import { CompoundUtilitiesModule } from "./compound-utilities.module";
import { CompoundUtilitiesService } from "./compound-utilities.service";

/** A consumer module's provider that injects the shared service, which only resolves when the module exports it. */
@Injectable()
class Consumer {
  constructor(readonly service: CompoundUtilitiesService) {}
}

describe(CompoundUtilitiesModule, () => {
  it("exports CompoundUtilitiesService", () => {
    expectModuleExports(CompoundUtilitiesModule, CompoundUtilitiesService);
  });

  it("lets a consumer that imports the module inject CompoundUtilitiesService", async () => {
    const { instance } = await buildTestingModule(Consumer, {
      imports: [CompoundUtilitiesModule],
    });

    expect(instance.service).toBeInstanceOf(CompoundUtilitiesService);
  });

  it("is the only provider of CompoundUtilitiesService across CharacteristicsModule", async () => {
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
        ({ instance }) => instance instanceof CompoundUtilitiesService,
      ),
    ).toHaveLength(1);
  });
});
