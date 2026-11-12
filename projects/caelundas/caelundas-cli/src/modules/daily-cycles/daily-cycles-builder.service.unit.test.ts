import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CalendarService } from "../calendar/calendar.service";
import { EphemerisService } from "../ephemeris/ephemeris.service";

import { DailyCyclesBuilderService } from "./daily-cycles-builder.service";

describe(DailyCyclesBuilderService, () => {
  let service: DailyCyclesBuilderService;

  const testingModuleOptions = { mocks: [CalendarService, EphemerisService] };

  beforeAll(async () => {
    const { instance } = await buildTestingModule(
      DailyCyclesBuilderService,
      testingModuleOptions,
    );

    service = instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      DailyCyclesBuilderService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(DailyCyclesBuilderService);
  });

  describe("rise and set rounding", () => {
    /** The minutes (indexes into `clearances`) at which `detector` fires. */
    function firingMinutes(
      clearances: number[],
      detector: "isRise" | "isSet",
    ): number[] {
      const minutes: number[] = [];
      for (let index = 1; index < clearances.length - 1; index++) {
        const window = {
          current: clearances[index] ?? Number.NaN,
          next: clearances[index + 1] ?? Number.NaN,
          previous: clearances[index - 1] ?? Number.NaN,
        };
        if (service[detector](window)) {
          minutes.push(index);
        }
      }
      return minutes;
    }

    it("puts a rise crossing exactly halfway between minutes on the later minute only", () => {
      expect(firingMinutes([-0.1, -0.05, 0.05, 0.1], "isRise")).toStrictEqual([
        2,
      ]);
    });

    it("puts a set crossing exactly halfway between minutes on the later minute only", () => {
      expect(firingMinutes([0.1, 0.05, -0.05, -0.1], "isSet")).toStrictEqual([
        2,
      ]);
    });

    it("puts a rise whose clearance is exactly 0 on that minute only", () => {
      expect(firingMinutes([-0.2, -0.1, 0, 0.1, 0.2], "isRise")).toStrictEqual([
        2,
      ]);
    });

    it("puts a set whose clearance is exactly 0 on that minute only", () => {
      expect(firingMinutes([0.2, 0.1, 0, -0.1, -0.2], "isSet")).toStrictEqual([
        2,
      ]);
    });
  });
});
