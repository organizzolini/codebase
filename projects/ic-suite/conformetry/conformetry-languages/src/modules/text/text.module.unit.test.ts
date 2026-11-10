import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { TextModule } from "./text.module";
import { TextService } from "./text.service";

describe(TextModule, () => {
  it("exports and provides TextService", () => {
    expectModuleExports(TextModule, TextService);
    expectModuleProvides(TextModule, TextService);
  });
});
