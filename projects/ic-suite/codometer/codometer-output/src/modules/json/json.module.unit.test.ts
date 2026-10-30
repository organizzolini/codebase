import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { JsonModule } from "./json.module";
import { JsonService } from "./json.service";

describe(JsonModule, () => {
  it("exports JsonService", () => {
    expectModuleExports(JsonModule, JsonService);
  });

  it("provides JsonService", () => {
    expectModuleProvides(JsonModule, JsonService);
  });
});
