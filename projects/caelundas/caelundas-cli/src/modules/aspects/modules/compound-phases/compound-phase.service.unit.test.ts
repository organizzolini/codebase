import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CompoundPhaseService } from "./compound-phase.service";

describe(CompoundPhaseService, () => {
  let service: CompoundPhaseService;

  beforeAll(async () => {
    const { instance } = await buildTestingModule(CompoundPhaseService);

    service = instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(CompoundPhaseService);

    expect(instance).toBeInstanceOf(CompoundPhaseService);
  });

  it("stamps dissolving at the first minute the pattern is gone", () => {
    const minute = moment.utc("2024-03-21T12:00:00.000Z");
    const result = service.determineCompoundPhaseFromSnapshots({
      checkPatternExists: (edges) => edges.length > 0,
      currentAspectBodies: [],
      currentMinute: minute,
      patternBodies: ["sun", "moon"],
      previousAspectBodies: [{ aspect: "conjunct", bodies: ["sun", "moon"] }],
    });

    expect(result?.phase).toBe("dissolving");
    expect(result?.eventMinute.toISOString()).toBe("2024-03-21T12:00:00.000Z");
  });
});
