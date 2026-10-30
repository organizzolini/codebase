import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { RenderModule } from "./render.module";
import { RenderService } from "./render.service";

describe(RenderModule, () => {
  it("exports RenderService", () => {
    expectModuleExports(RenderModule, RenderService);
  });

  it("provides RenderService", () => {
    expectModuleProvides(RenderModule, RenderService);
  });
});
