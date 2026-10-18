import { describe, expect, it } from "vitest";

import { ProcessRunnerModule } from "./process-runner.module";
import { ProcessRunnerService } from "./process-runner.service";

describe(ProcessRunnerModule, () => {
  it("provides and exports the process runner", () => {
    expect.hasAssertions();

    const providers = Reflect.getMetadata("providers", ProcessRunnerModule) as
      | undefined
      | unknown[];
    const exports = Reflect.getMetadata("exports", ProcessRunnerModule) as
      | undefined
      | unknown[];

    expect(providers).toContain(ProcessRunnerService);
    expect(exports).toContain(ProcessRunnerService);
  });
});
