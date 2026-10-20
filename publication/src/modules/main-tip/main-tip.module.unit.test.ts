import { describe, expect, it } from "vitest";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { MainTipModule } from "./main-tip.module";
import { MainTipService } from "./main-tip.service";

describe(MainTipModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", MainTipModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", MainTipModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(ProcessRunnerModule);
    expect(providers).toContain(MainTipService);
  });
});
