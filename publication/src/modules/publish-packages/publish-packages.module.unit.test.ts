import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseGroupModule } from "../release-group/release-group.module";

import { PublishPackagesCommand } from "./publish-packages.command";
import { PublishPackagesModule } from "./publish-packages.module";
import { PublishPackagesService } from "./publish-packages.service";

describe(PublishPackagesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", PublishPackagesModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      PublishPackagesModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(imports).toContain(ReleaseGroupModule);
    expect(providers).toContain(PublishPackagesCommand);
    expect(providers).toContain(PublishPackagesService);
  });
});
