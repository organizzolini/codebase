import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it, vi } from "vitest";

import { MeanderawDatabaseAggregatesService } from "@codebase/meanderaw-db";
import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { AggregateCommand } from "./aggregate.command";

import type { TestingModuleOptions } from "@codebase/testing/nestjs";

/** The one collaborator `AggregateCommand` needs, counting its rebuilds. */
const aggregates = (
  rebuild = vi.fn<() => Promise<void>>(),
): TestingModuleOptions => ({
  providers: [
    {
      provide: MeanderawDatabaseAggregatesService,
      useValue: createMock<MeanderawDatabaseAggregatesService>({ rebuild }),
    },
  ],
});

describe(AggregateCommand, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      AggregateCommand,
      aggregates(),
    );

    expect(instance).toBeInstanceOf(AggregateCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(AggregateCommand, aggregates());
  });

  it("rebuilds the aggregate counts once when run", async () => {
    const rebuild = vi.fn<() => Promise<void>>();
    const { instance } = await buildTestingModule(
      AggregateCommand,
      aggregates(rebuild),
    );

    await instance.run();

    expect(rebuild).toHaveBeenCalledExactlyOnceWith();
  });
});
