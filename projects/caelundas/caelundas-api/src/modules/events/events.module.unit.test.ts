import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { EventsModule } from "./events.module";
import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";

describe(EventsModule, () => {
  it("provides its resolver and service", () => {
    expectModuleProvides(EventsModule, EventsResolver, EventsService);
  });

  it("exports its service", () => {
    expectModuleExports(EventsModule, EventsService);
  });
});
