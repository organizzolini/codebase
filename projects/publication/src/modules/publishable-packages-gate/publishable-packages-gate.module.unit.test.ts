import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { PublishablePackagesGateCommand } from "./publishable-packages-gate.command";
import { PublishablePackagesGateModule } from "./publishable-packages-gate.module";
import { PublishablePackagesGateService } from "./publishable-packages-gate.service";

describe(PublishablePackagesGateModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata(
      "imports",
      PublishablePackagesGateModule,
    ) as undefined | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      PublishablePackagesGateModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(providers).toContain(PublishablePackagesGateCommand);
    expect(providers).toContain(PublishablePackagesGateService);
  });
});
