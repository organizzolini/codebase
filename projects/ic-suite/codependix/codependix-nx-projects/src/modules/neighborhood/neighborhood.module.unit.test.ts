import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { NeighborhoodModule } from "./neighborhood.module";
import { NeighborhoodService } from "./neighborhood.service";

describe(NeighborhoodModule, () => {
  it("exports and provides NeighborhoodService", () => {
    expectModuleExports(NeighborhoodModule, NeighborhoodService);
    expectModuleProvides(NeighborhoodModule, NeighborhoodService);
  });
});
