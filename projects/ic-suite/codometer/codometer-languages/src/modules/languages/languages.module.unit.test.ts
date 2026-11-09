import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { LanguagesModule } from "./languages.module";
import { LanguagesService } from "./languages.service";

describe(LanguagesModule, () => {
  it("exports and provides LanguagesService", () => {
    expectModuleExports(LanguagesModule, LanguagesService);
    expectModuleProvides(LanguagesModule, LanguagesService);
  });
});
