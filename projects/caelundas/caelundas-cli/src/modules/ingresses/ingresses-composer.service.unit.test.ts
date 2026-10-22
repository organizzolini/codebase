import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { EphemerisService } from "../ephemeris/ephemeris.service";

import { IngressesComposerService } from "./ingresses-composer.service";

describe(IngressesComposerService, () => {
  let service: IngressesComposerService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IngressesComposerService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: EphemerisService, useValue: createMock<EphemerisService>() },
      ],
    }).compile();

    service = await module.resolve(IngressesComposerService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
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
