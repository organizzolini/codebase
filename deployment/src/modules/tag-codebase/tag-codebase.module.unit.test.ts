import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { MainTipModule } from "../main-tip/main-tip.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { TagCodebaseCommand } from "./tag-codebase.command";
import { TagCodebaseModule } from "./tag-codebase.module";
import { TagCodebaseService } from "./tag-codebase.service";

describe(TagCodebaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", TagCodebaseModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", TagCodebaseModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(MainTipModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(providers).toContain(TagCodebaseCommand);
    expect(providers).toContain(TagCodebaseService);
  });
});
