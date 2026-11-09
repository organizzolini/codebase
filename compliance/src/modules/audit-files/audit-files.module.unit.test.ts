import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { AuditFilesCommand } from "./audit-files.command";
import { AuditFilesModule } from "./audit-files.module";
import { AuditFilesService } from "./audit-files.service";

describe(AuditFilesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", AuditFilesModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", AuditFilesModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(providers).toContain(AuditFilesCommand);
    expect(providers).toContain(AuditFilesService);
  });
});
