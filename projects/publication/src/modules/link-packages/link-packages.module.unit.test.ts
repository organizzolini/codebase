import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseGroupModule } from "../release-group/release-group.module";

import { LinkPackagesCommand } from "./link-packages.command";
import { LinkPackagesModule } from "./link-packages.module";
import { LinkPackagesService } from "./link-packages.service";

describe(LinkPackagesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", LinkPackagesModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", LinkPackagesModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(imports).toContain(ReleaseGroupModule);
    expect(providers).toContain(LinkPackagesCommand);
    expect(providers).toContain(LinkPackagesService);
  });
});
