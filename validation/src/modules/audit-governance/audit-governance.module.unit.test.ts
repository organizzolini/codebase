import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { AuditGovernanceCommand } from "./audit-governance.command";
import { AuditGovernanceModule } from "./audit-governance.module";
import { AuditGovernanceService } from "./audit-governance.service";

describe(AuditGovernanceModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(AuditGovernanceModule, LoggerModule);
    expectModuleProvides(
      AuditGovernanceModule,
      AuditGovernanceCommand,
      AuditGovernanceService,
    );
  });
});
