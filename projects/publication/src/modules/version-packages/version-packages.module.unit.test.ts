import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { MainTipModule } from "../main-tip/main-tip.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { TagPackagesModule } from "../tag-packages/tag-packages.module";

import { VersionPackagesCommand } from "./version-packages.command";
import { VersionPackagesModule } from "./version-packages.module";
import { VersionPackagesService } from "./version-packages.service";

describe(VersionPackagesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", VersionPackagesModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      VersionPackagesModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(MainTipModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(imports).toContain(TagPackagesModule);
    expect(providers).toContain(VersionPackagesCommand);
    expect(providers).toContain(VersionPackagesService);
  });
});
