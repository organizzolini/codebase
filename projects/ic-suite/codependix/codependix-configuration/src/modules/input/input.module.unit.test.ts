import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { InputModule } from "./input.module";
import { InputService } from "./input.service";

describe(InputModule, () => {
  it("exports and provides InputService", () => {
    expectModuleExports(InputModule, InputService);
    expectModuleProvides(InputModule, InputService);
  });
});
