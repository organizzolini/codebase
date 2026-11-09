import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { PublishablePackagesChecksService } from "./publishable-packages-checks.service";
import { PublishablePackagesConsumerService } from "./publishable-packages-consumer.service";
import { PublishablePackagesProcessService } from "./publishable-packages-process.service";
import { PublishablePackagesCommand } from "./publishable-packages.command";
import { PublishablePackagesModule } from "./publishable-packages.module";
import { PublishablePackagesService } from "./publishable-packages.service";

describe(PublishablePackagesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(PublishablePackagesModule, LoggerModule);
    expectModuleProvides(
      PublishablePackagesModule,
      PublishablePackagesChecksService,
      PublishablePackagesCommand,
      PublishablePackagesConsumerService,
      PublishablePackagesProcessService,
      PublishablePackagesService,
    );
  });
});
