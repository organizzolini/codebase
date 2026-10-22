import { describe, expect, it } from "vitest";

import { BestEffortLedgerModule } from "./best-effort-ledger.module";
import { BestEffortLedgerService } from "./best-effort-ledger.service";

describe(BestEffortLedgerModule, () => {
  it("provides and exports the ledger service", () => {
    expect.hasAssertions();

    const exported = Reflect.getMetadata("exports", BestEffortLedgerModule) as
      | undefined
      | unknown[];

    expect(exported).toContain(BestEffortLedgerService);
  });
});
