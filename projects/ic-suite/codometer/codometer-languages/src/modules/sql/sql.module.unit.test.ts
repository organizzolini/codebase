import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { SqlModule } from "./sql.module";
import { SqlService } from "./sql.service";

describe(SqlModule, () => {
  it("exports and provides SqlService", () => {
    expectModuleExports(SqlModule, SqlService);
    expectModuleProvides(SqlModule, SqlService);
  });
});
