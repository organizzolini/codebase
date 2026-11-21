import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { MarkdownModule } from "./markdown.module";
import { MarkdownService } from "./markdown.service";

describe(MarkdownModule, () => {
  it("exports and provides MarkdownService", () => {
    expectModuleExports(MarkdownModule, MarkdownService);
    expectModuleProvides(MarkdownModule, MarkdownService);
  });
});
