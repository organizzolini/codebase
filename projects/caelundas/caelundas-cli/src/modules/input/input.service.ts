import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { LoggerService } from "@codebase/observability";

import { inputSchema } from "./input.constants";

import type { Environment, Input } from "./input.types";

/**
 * NestJS service that reads validated environment variables from {@link ConfigService}
 * and parses them into a domain {@link Input} object.
 *
 * Bridges the infrastructure config layer (raw primitives validated at bootstrap by
 * {@link Environment}) and the domain layer (timezone-aware Moment objects, derived timezone).
 */
@Injectable()
export class InputService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(InputService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Returns the calendar year of `START_YEAR + JOB_COMPLETION_INDEX` as dates when
   * both are set, otherwise the `START_DATE` and `END_DATE` as given.
   */
  private resolveDateRange(): {
    endDate: string | undefined;
    startDate: string | undefined;
  } {
    const startYear = this.configService.get<number>("START_YEAR");
    const jobCompletionIndex = this.configService.get<number>(
      "JOB_COMPLETION_INDEX",
    );

    if (startYear === undefined || jobCompletionIndex === undefined) {
      return {
        endDate: this.configService.get<string>("END_DATE"),
        startDate: this.configService.get<string>("START_DATE"),
      };
    }

    const year = startYear + jobCompletionIndex;
    this.logger.info(
      "📅 Derived the year from START_YEAR and JOB_COMPLETION_INDEX; START_DATE and END_DATE are ignored",
      undefined,
      { year },
    );

    return { endDate: `${year}-12-31`, startDate: `${year}-01-01` };
  }

  // 🌎 Public Methods

  /**
   * Validates the environment into an `Input`: coordinates, IANA timezone, and
   * the date range.
   */
  parse(): Input {
    const { endDate, startDate } = this.resolveDateRange();
    const input = inputSchema.parse({
      endDate,
      latitude: this.configService.get<number>("LATITUDE"),
      longitude: this.configService.get<number>("LONGITUDE"),
      startDate,
    });

    this.logger.debug("📥 Parsed input configuration", undefined, {
      endDate: input.end.toISOString(),
      latitude: input.latitude,
      longitude: input.longitude,
      startDate: input.start.toISOString(),
      timezone: input.timezone,
    });

    return input;
  }
}
