import { describe, expect, it } from "vitest";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { ReleaseGroupModule } from "./release-group.module";
import { ReleaseGroupService } from "./release-group.service";

describe(ReleaseGroupModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", ReleaseGroupModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", ReleaseGroupModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(ProcessRunnerModule);
    expect(providers).toContain(ReleaseGroupService);
  });
});
