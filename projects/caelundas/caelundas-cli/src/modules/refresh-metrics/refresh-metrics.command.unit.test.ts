import { getDataSourceToken } from "@nestjs/typeorm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { CaelundasDatabaseService } from "@codebase/caelundas-db";
import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { RefreshMetricsCommand } from "./refresh-metrics.command";

import type { LoggerServiceContract } from "@codebase/observability";
import type { DeepMocked } from "@golevelup/ts-vitest";

describe(RefreshMetricsCommand, () => {
  const manager = { name: "manager" };
  const testingModuleOptions = {
    mocks: [CaelundasDatabaseService],
    providers: [{ provide: getDataSourceToken(), useValue: { manager } }],
  };
  let command: RefreshMetricsCommand;
  let databaseService: DeepMocked<CaelundasDatabaseService>;
  let logger: DeepMocked<LoggerServiceContract>;

  beforeAll(async () => {
    const built = await buildTestingModule(
      RefreshMetricsCommand,
      testingModuleOptions,
    );

    command = built.instance;
    databaseService = built.mock(CaelundasDatabaseService);
    logger = built.logger;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      RefreshMetricsCommand,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(RefreshMetricsCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(RefreshMetricsCommand, testingModuleOptions);
  });

  it("refreshes the metrics facts through the data source's manager", async () => {
    await command.run();

    expect(databaseService.refreshMetrics).toHaveBeenCalledExactlyOnceWith(
      manager,
    );
  });

  it("logs how long the refresh took", async () => {
    await command.run();

    expect(logger.info).toHaveBeenCalledWith(
      "🔄 Refreshed the metrics facts",
      undefined,
      { milliseconds: expect.any(Number) },
    );
  });
});
