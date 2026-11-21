import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { JsonModule } from "./json.module";
import { JsonService } from "./json.service";

describe(JsonModule, () => {
  it("exports and provides JsonService", () => {
    expectModuleExports(JsonModule, JsonService);
    expectModuleProvides(JsonModule, JsonService);
  });
});
