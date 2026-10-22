import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { BestEffortLedgerModule } from "../best-effort-ledger/best-effort-ledger.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { BestEffortSnapshotService } from "./best-effort-snapshot.service";
import { BestEffortCommand } from "./best-effort.command";
import { BestEffortModule } from "./best-effort.module";

describe(BestEffortModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", BestEffortModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", BestEffortModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(BestEffortLedgerModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(providers).toContain(BestEffortCommand);
    expect(providers).toContain(BestEffortSnapshotService);
  });
});
