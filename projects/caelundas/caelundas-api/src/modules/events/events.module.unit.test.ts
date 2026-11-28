import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { EventsModule } from "./events.module";
import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";
import { EventMetricsResolver } from "./modules/metrics/event-metrics.resolver";
import { EventMetricsService } from "./modules/metrics/event-metrics.service";

describe(EventsModule, () => {
  it("provides its resolver and service", () => {
    expectModuleProvides(
      EventsModule,
      EventsResolver,
      EventsService,
      EventMetricsResolver,
      EventMetricsService,
    );
  });

  it("exports its service", () => {
    expectModuleExports(EventsModule, EventsService);
  });
});
