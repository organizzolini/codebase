import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { DocumentsModule } from "./documents.module";
import { DocumentsService } from "./documents.service";

describe(DocumentsModule, () => {
  it("exports and provides DocumentsService", () => {
    expectModuleExports(DocumentsModule, DocumentsService);
    expectModuleProvides(DocumentsModule, DocumentsService);
  });
});
