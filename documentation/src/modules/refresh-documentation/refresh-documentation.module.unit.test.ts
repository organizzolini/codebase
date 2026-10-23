import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { RefreshDocumentationCommand } from "./refresh-documentation.command";
import { RefreshDocumentationModule } from "./refresh-documentation.module";
import { RefreshDocumentationService } from "./refresh-documentation.service";

describe(RefreshDocumentationModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata(
      "imports",
      RefreshDocumentationModule,
    ) as undefined | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      RefreshDocumentationModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(providers).toContain(RefreshDocumentationCommand);
    expect(providers).toContain(RefreshDocumentationService);
  });
});
