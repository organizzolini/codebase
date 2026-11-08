import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { MainTipModule } from "../main-tip/main-tip.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseGroupModule } from "../release-group/release-group.module";

import { TagPackagesCommand } from "./tag-packages.command";
import { TagPackagesModule } from "./tag-packages.module";
import { TagPackagesService } from "./tag-packages.service";

describe(TagPackagesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", TagPackagesModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", TagPackagesModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(MainTipModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(imports).toContain(ReleaseGroupModule);
    expect(providers).toContain(TagPackagesCommand);
    expect(providers).toContain(TagPackagesService);
  });
});
