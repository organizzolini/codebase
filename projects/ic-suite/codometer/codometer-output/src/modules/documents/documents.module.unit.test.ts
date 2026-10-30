import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { DocumentsModule } from "./documents.module";
import { DocumentsService } from "./documents.service";

describe(DocumentsModule, () => {
  it("exports DocumentsService", () => {
    expectModuleExports(DocumentsModule, DocumentsService);
  });

  it("provides DocumentsService", () => {
    expectModuleProvides(DocumentsModule, DocumentsService);
  });
});
