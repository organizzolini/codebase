import { beforeAll, describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { LocalServicesCommand } from "./local-services.command";
import { LocalServicesService } from "./local-services.service";

describe(LocalServicesCommand, () => {
  const moduleOptions = { mocks: [LocalServicesService] };
  let command: LocalServicesCommand;
  let service: LocalServicesService;

  beforeAll(async () => {
    const { module } = await buildTestingModule(
      LocalServicesCommand,
      moduleOptions,
    );

    command = await module.resolve(LocalServicesCommand);
    service = await module.resolve(LocalServicesService);
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      LocalServicesCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(LocalServicesCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(LocalServicesCommand, moduleOptions);
  });

  it("starts the local services", async () => {
    expect.hasAssertions();

    await command.run();

    expect(service.startLocalServices).toHaveBeenCalledWith();
  });
});
