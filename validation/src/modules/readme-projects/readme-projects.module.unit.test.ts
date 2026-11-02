import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ReadmeProjectsCommand } from "./readme-projects.command";
import { ReadmeProjectsModule } from "./readme-projects.module";
import { ReadmeProjectsService } from "./readme-projects.service";

describe(ReadmeProjectsModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(ReadmeProjectsModule, LoggerModule);
    expectModuleProvides(
      ReadmeProjectsModule,
      ReadmeProjectsCommand,
      ReadmeProjectsService,
    );
  });
});
