import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { RemoteCacheCommand } from "./remote-cache.command";
import { RemoteCacheService } from "./remote-cache.service";

describe(RemoteCacheCommand, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RemoteCacheCommand, {
      mocks: [RemoteCacheService],
    });

    expect(instance).toBeInstanceOf(RemoteCacheCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(RemoteCacheCommand, {
      mocks: [RemoteCacheService],
    });
  });

  it("sets up the remote cache when it runs", async () => {
    const remoteCache = createMock<RemoteCacheService>();
    const { module } = await buildTestingModule(RemoteCacheCommand, {
      providers: [{ provide: RemoteCacheService, useValue: remoteCache }],
    });

    const subject = await module.resolve(RemoteCacheCommand);

    await subject.run();

    expect(remoteCache.setUpRemoteCache).toHaveBeenCalledWith();
  });
});
