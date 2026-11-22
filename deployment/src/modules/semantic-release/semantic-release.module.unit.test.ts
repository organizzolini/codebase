import { describe, expect, it } from "vitest";

import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { SemanticReleaseModule } from "./semantic-release.module";
import { SemanticReleaseService } from "./semantic-release.service";

describe(SemanticReleaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(SemanticReleaseModule);
    expectModuleProvides(SemanticReleaseModule, SemanticReleaseService);
  });
});
