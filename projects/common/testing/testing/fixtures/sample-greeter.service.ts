import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { SampleClockService } from "./sample-clock.service";

/** A class under test that injects the logger and one dependency. */
@Injectable()
export class SampleGreeterService {
  public constructor(
    private readonly clock: SampleClockService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SampleGreeterService.name);
  }

  /** Greets someone, stamped with the clock's time. */
  public greet(name: string): string {
    return `${this.clock.now()} salve, ${name}`;
  }
}
