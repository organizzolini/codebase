import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { RenderModule } from "./render.module";
import { RenderService } from "./render.service";

describe(RenderModule, () => {
  it("exports and provides RenderService", () => {
    expectModuleExports(RenderModule, RenderService);
    expectModuleProvides(RenderModule, RenderService);
  });
});
