import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { InventoryModule } from "./inventory.module";
import { InventoryService } from "./inventory.service";

describe(InventoryModule, () => {
  it("exports and provides InventoryService", () => {
    expectModuleExports(InventoryModule, InventoryService);
    expectModuleProvides(InventoryModule, InventoryService);
  });
});
