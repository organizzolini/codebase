import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { CollectCodometerBaselineCommand } from "./collect-codometer-baseline.command";
import { CollectCodometerBaselineModule } from "./collect-codometer-baseline.module";
import { CollectCodometerBaselineService } from "./collect-codometer-baseline.service";

describe(CollectCodometerBaselineModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata(
      "imports",
      CollectCodometerBaselineModule,
    ) as undefined | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      CollectCodometerBaselineModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(providers).toContain(CollectCodometerBaselineCommand);
    expect(providers).toContain(CollectCodometerBaselineService);
  });
});
