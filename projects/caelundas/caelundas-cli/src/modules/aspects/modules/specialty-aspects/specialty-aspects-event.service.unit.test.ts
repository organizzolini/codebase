import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { AspectEventFormattingService } from "../formatting/aspect-event-formatting.service";
import { AspectsUtilitiesService } from "../utilities/aspects-utilities.service";

import { SpecialtyAspectsEventService } from "./specialty-aspects-event.service";

describe(SpecialtyAspectsEventService, () => {
  const testingModuleOptions = {
    mocks: [
      AspectsUtilitiesService,
      AspectEventFormattingService,
      EphemerisService,
    ],
  };

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      SpecialtyAspectsEventService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(SpecialtyAspectsEventService);
  });
});
