import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { BoundBaseToPushCommand } from "./bound-base-to-push.command";
import { BoundBaseToPushModule } from "./bound-base-to-push.module";
import { BoundBaseToPushService } from "./bound-base-to-push.service";

describe(BoundBaseToPushModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", BoundBaseToPushModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      BoundBaseToPushModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(providers).toContain(BoundBaseToPushCommand);
    expect(providers).toContain(BoundBaseToPushService);
  });
});
