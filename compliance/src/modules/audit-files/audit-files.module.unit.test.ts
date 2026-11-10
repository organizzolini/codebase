import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { AuditFilesCommand } from "./audit-files.command";
import { AuditFilesModule } from "./audit-files.module";
import { AuditFilesService } from "./audit-files.service";

describe(AuditFilesModule, () => {
  it("imports the logger", () => {
    expectModuleImports(AuditFilesModule, LoggerModule);
  });

  it("provides its command and service", () => {
    expectModuleProvides(
      AuditFilesModule,
      AuditFilesCommand,
      AuditFilesService,
    );
  });

  it("exports its command and service", () => {
    expectModuleExports(AuditFilesModule, AuditFilesCommand, AuditFilesService);
  });
});
