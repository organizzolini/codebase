import { beforeAll, describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { NightSkyCommand } from "./night-sky.command";
import { NightSkySourceError } from "./night-sky.constants";
import { NightSkyService } from "./night-sky.service";

import type { DeepMocked } from "@golevelup/ts-vitest";

describe(NightSkyCommand, () => {
  const testingModuleOptions = { mocks: [NightSkyService] };
  let command: NightSkyCommand;
  let nightSkyService: DeepMocked<NightSkyService>;

  beforeAll(async () => {
    const built = await buildTestingModule(
      NightSkyCommand,
      testingModuleOptions,
    );

    command = built.instance;
    nightSkyService = built.mock(NightSkyService);
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      NightSkyCommand,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(NightSkyCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(NightSkyCommand, testingModuleOptions);
  });

  it("passes each option through as it was given", () => {
    expect(command.parseConstellations("c.json")).toBe("c.json");
    expect(command.parseLines("l.json")).toBe("l.json");
    expect(command.parseStars("hyg.csv")).toBe("hyg.csv");
  });

  it("ingests the three files", async () => {
    await command.run([], {
      constellations: "c.json",
      lines: "l.json",
      stars: "hyg.csv",
    });

    expect(nightSkyService.ingest).toHaveBeenCalledWith({
      constellations: "c.json",
      lines: "l.json",
      stars: "hyg.csv",
    });
  });

  it("refuses to run without a file", async () => {
    await expect(command.run([], { stars: "hyg.csv" })).rejects.toThrow(
      NightSkySourceError,
    );
  });
});
