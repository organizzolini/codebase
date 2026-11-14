import { Injectable } from "@nestjs/common";
import { DiscoveryModule, DiscoveryService } from "@nestjs/core";
import { describe, expect, it } from "vitest";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";
import {
  buildTestingModule,
  expectModuleExports,
} from "@codebase/testing/nestjs";

import { CharacteristicContextService } from "../characteristic-context.service";
import { CharacteristicsModule } from "../characteristics.module";

import { PathUtilitiesModule } from "./path-utilities.module";
import { PathUtilitiesService } from "./path-utilities.service";

/** A consumer module's provider that injects the shared service, which only resolves when the module exports it. */
@Injectable()
class Consumer {
  constructor(readonly service: PathUtilitiesService) {}
}

describe(PathUtilitiesModule, () => {
  it("exports PathUtilitiesService", () => {
    expectModuleExports(PathUtilitiesModule, PathUtilitiesService);
  });

  it("lets a consumer that imports the module inject PathUtilitiesService", async () => {
    const { instance } = await buildTestingModule(Consumer, {
      imports: [PathUtilitiesModule],
    });

    expect(instance.service).toBeInstanceOf(PathUtilitiesService);
  });

  it("is the only provider of PathUtilitiesService across CharacteristicsModule", async () => {
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
        ({ instance }) => instance instanceof PathUtilitiesService,
      ),
    ).toHaveLength(1);
  });
});
