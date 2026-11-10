import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { EphemerisService } from "../ephemeris/ephemeris.service";

import { IngressesComposerService } from "./ingresses-composer.service";

describe(IngressesComposerService, () => {
  let service: IngressesComposerService;

  const testingModuleOptions = { mocks: [EphemerisService] };

  beforeAll(async () => {
    const { instance } = await buildTestingModule(
      IngressesComposerService,
      testingModuleOptions,
    );

    service = instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      IngressesComposerService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(IngressesComposerService);
  });

  describe("body names across ingress kinds", () => {
    const date = moment.utc("2026-02-17T12:00:00.000Z");
    const body = "north lunar node";

    it("uses one body name and tag for sign, decan and peak ingresses", () => {
      const sign = service.buildSignIngressEvent({ body, date, longitude: 5 });
      const decan = service.buildDecanIngressEvent({
        body,
        date,
        longitude: 10,
      });
      const peak = service.buildPeakIngressEvent({ body, date, longitude: 15 });

      for (const event of [sign, decan, peak]) {
        expect(event.tags).toContain("North Lunar Node");
        expect(event.tags).not.toContain("North lunar node");
        expect(event.description).toContain("North Lunar Node");
      }
    });

    it("recovers the body from a start-case tag", () => {
      const sign = service.buildSignIngressEvent({ body, date, longitude: 5 });

      expect(
        service.extractSignAndBodyFromTags(sign.tags, "North Lunar Node").body,
      ).toBe(body);
    });
  });
});
