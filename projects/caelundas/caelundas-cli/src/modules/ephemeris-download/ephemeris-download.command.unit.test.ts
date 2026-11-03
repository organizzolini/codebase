import { beforeAll, describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { EphemerisDownloadCommand } from "./ephemeris-download.command";
import { EphemerisDownloadService } from "./ephemeris-download.service";

import type { DeepMocked } from "@golevelup/ts-vitest";

describe(EphemerisDownloadCommand, () => {
  const testingModuleOptions = { mocks: [EphemerisDownloadService] };
  let command: EphemerisDownloadCommand;
  let service: DeepMocked<EphemerisDownloadService>;

  beforeAll(async () => {
    const built = await buildTestingModule(
      EphemerisDownloadCommand,
      testingModuleOptions,
    );

    command = built.instance;
    service = built.mock(EphemerisDownloadService);
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      EphemerisDownloadCommand,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(EphemerisDownloadCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(EphemerisDownloadCommand, testingModuleOptions);
  });

  it("downloads the ephemeris files", async () => {
    await command.run();

    expect(service.download).toHaveBeenCalledWith();
  });
});
