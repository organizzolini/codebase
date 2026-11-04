import { Injectable } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { LoggerService } from "../../src/modules/logger/logger.service";

import { expectLoggerContext } from "./testing-module.utilities";

// 🧪 Tests

/** A dependency of the class under test, which the test mocks. */
@Injectable()
class SampleClockService {
  public now(): string {
    return new Date().toISOString();
  }
}

/** A class under test that names its logger context after itself. */
@Injectable()
class SampleGreeterService {
  public constructor(
    private readonly clock: SampleClockService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SampleGreeterService.name);
  }

  public greet(name: string): string {
    return `${this.clock.now()} salve, ${name}`;
  }
}

describe(expectLoggerContext, () => {
  it("passes for a class that names its logger context after itself", async () => {
    await expect(
      expectLoggerContext(SampleGreeterService, {
        mocks: [SampleClockService],
      }),
    ).resolves.toBeUndefined();
  });

  it("fails for a class that never sets its logger context", async () => {
    await expect(expectLoggerContext(SampleClockService)).rejects.toThrow(
      /setContext/u,
    );
  });
});
