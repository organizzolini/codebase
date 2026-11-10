import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { AuditGovernanceCommand } from "./audit-governance.command";
import { AuditGovernanceModule } from "./audit-governance.module";
import { AuditGovernanceService } from "./audit-governance.service";

describe(AuditGovernanceModule, () => {
  it("imports the logger", () => {
    expectModuleImports(AuditGovernanceModule, LoggerModule);
  });

  it("provides its command and service", () => {
    expectModuleProvides(
      AuditGovernanceModule,
      AuditGovernanceCommand,
      AuditGovernanceService,
    );
  });

  it("exports its command and service", () => {
    expectModuleExports(
      AuditGovernanceModule,
      AuditGovernanceCommand,
      AuditGovernanceService,
    );
  });
});
