import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { DeclarationCommentsService } from "./declaration-comments.service";
import { TypescriptModule } from "./typescript.module";
import { TypescriptService } from "./typescript.service";

describe(TypescriptModule, () => {
  it("exports and provides TypescriptService", () => {
    expectModuleExports(TypescriptModule, TypescriptService);
    expectModuleProvides(
      TypescriptModule,
      TypescriptService,
      DeclarationCommentsService,
    );
  });
});
