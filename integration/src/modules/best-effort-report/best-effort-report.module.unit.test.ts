import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { BestEffortLedgerModule } from "../best-effort-ledger/best-effort-ledger.module";

import { BestEffortReportCommand } from "./best-effort-report.command";
import { BestEffortReportModule } from "./best-effort-report.module";

describe(BestEffortReportModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", BestEffortReportModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      BestEffortReportModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(BestEffortLedgerModule);
    expect(providers).toContain(BestEffortReportCommand);
  });
});
