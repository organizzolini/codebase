import { beforeAll, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CollectCodometerBaselineCommand } from "./collect-codometer-baseline.command";
import { CollectCodometerBaselineService } from "./collect-codometer-baseline.service";

describe(CollectCodometerBaselineCommand, () => {
  const collect = vi.fn<CollectCodometerBaselineService["collect"]>();
  let command: CollectCodometerBaselineCommand;

  beforeAll(async () => {
    const { module } = await buildTestingModule(
      CollectCodometerBaselineCommand,
      {
        providers: [
          { provide: CollectCodometerBaselineService, useValue: { collect } },
        ],
      },
    );

    command = await module.resolve(CollectCodometerBaselineCommand);
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      CollectCodometerBaselineCommand,
      {
        providers: [
          { provide: CollectCodometerBaselineService, useValue: { collect } },
        ],
      },
    );

    expect(instance).toBeInstanceOf(CollectCodometerBaselineCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(CollectCodometerBaselineCommand, {
      providers: [
        { provide: CollectCodometerBaselineService, useValue: { collect } },
      ],
    });
  });

  it("prints what the service reports", async () => {
    expect.hasAssertions();

    const printed: string[] = [];

    vi.spyOn(console, "info").mockImplementation((line: string) => {
      printed.push(line);
    });
    collect.mockReturnValue({ lines: ["one", "two"] });

    await command.run();

    expect(printed).toStrictEqual(["one", "two"]);
  });
});
