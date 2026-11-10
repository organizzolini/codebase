import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { RefreshDocumentationCommand } from "./refresh-documentation.command";
import { RefreshDocumentationModule } from "./refresh-documentation.module";
import { RefreshDocumentationService } from "./refresh-documentation.service";

describe(RefreshDocumentationModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(RefreshDocumentationModule, LoggerModule);
    expectModuleProvides(
      RefreshDocumentationModule,
      RefreshDocumentationCommand,
      RefreshDocumentationService,
    );
  });
});
