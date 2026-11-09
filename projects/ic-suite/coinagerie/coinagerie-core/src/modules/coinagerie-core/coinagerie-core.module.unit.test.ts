import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { CoinagerieCoreModule } from "./coinagerie-core.module";
import { CoinagerieCoreService } from "./coinagerie-core.service";

describe(CoinagerieCoreModule, () => {
  it("exports and provides CoinagerieCoreService", () => {
    expectModuleExports(CoinagerieCoreModule, CoinagerieCoreService);
    expectModuleProvides(CoinagerieCoreModule, CoinagerieCoreService);
  });
});
