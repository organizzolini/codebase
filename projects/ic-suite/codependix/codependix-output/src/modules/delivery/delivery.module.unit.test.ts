import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { DeliveryModule } from "./delivery.module";
import { DeliveryService } from "./delivery.service";

describe(DeliveryModule, () => {
  it("exports and provides DeliveryService", () => {
    expectModuleExports(DeliveryModule, DeliveryService);
    expectModuleProvides(DeliveryModule, DeliveryService);
  });
});
