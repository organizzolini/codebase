import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { MarkdownModule } from "./markdown.module";
import { MarkdownService } from "./markdown.service";

describe(MarkdownModule, () => {
  it("exports MarkdownService", () => {
    expectModuleExports(MarkdownModule, MarkdownService);
  });

  it("provides MarkdownService", () => {
    expectModuleProvides(MarkdownModule, MarkdownService);
  });
});
