import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { AspectEphemerisService } from "../calculation/aspect-ephemeris.service";
import { AspectEventFormattingService } from "../formatting/aspect-event-formatting.service";
import { AspectsUtilitiesService } from "../utilities/aspects-utilities.service";

import { MinorAspectsEventService } from "./minor-aspects-event.service";

describe(MinorAspectsEventService, () => {
  const testingModuleOptions = {
    mocks: [
      AspectEphemerisService,
      AspectsUtilitiesService,
      AspectEventFormattingService,
    ],
  };

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      MinorAspectsEventService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(MinorAspectsEventService);
  });
});
