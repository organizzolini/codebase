import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { ReleaseArchivesModule } from "../release-archives/release-archives.module";
import { SoftwareModule } from "../software/software.module";

import { ToolsCommand } from "./tools.command";
import { ToolsModule } from "./tools.module";
import { ToolsService } from "./tools.service";

describe(ToolsModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", ToolsModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", ToolsModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(ReleaseArchivesModule);
    expect(imports).toContain(SoftwareModule);
    expect(providers).toContain(ToolsCommand);
    expect(providers).toContain(ToolsService);
  });
});
