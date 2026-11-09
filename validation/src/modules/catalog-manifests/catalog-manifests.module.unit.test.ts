import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { CatalogManifestsCommand } from "./catalog-manifests.command";
import { CatalogManifestsModule } from "./catalog-manifests.module";
import { CatalogManifestsService } from "./catalog-manifests.service";

describe(CatalogManifestsModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(CatalogManifestsModule, LoggerModule);
    expectModuleProvides(
      CatalogManifestsModule,
      CatalogManifestsCommand,
      CatalogManifestsService,
    );
  });
});
