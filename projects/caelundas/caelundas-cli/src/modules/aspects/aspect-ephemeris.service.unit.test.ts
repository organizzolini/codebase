import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { EphemerisService } from "../ephemeris/ephemeris.service";

import { AspectEphemerisService } from "./aspect-ephemeris.service";

describe(AspectEphemerisService, () => {
  const testingModuleOptions = { mocks: [EphemerisService] };

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      AspectEphemerisService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(AspectEphemerisService);
  });
});
