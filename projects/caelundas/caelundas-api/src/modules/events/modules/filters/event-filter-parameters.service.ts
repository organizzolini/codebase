import { Injectable } from "@nestjs/common";

import { PLACEHOLDER_PREFIX } from "./event-filter-sql.constants";

import type { EventFilterParameters } from "./event-filter.types";

/**
 * Binds the values a compiled filter or grouping stands for, the `$n`
 * placeholders of one query.
 */
@Injectable()
export class EventFilterParametersService {
  /**
   * Binds a value and answers the placeholder that stands for it, numbered
   * after the parameters the query already binds.
   */
  public bind(parameters: EventFilterParameters, value: unknown): string {
    parameters.values.push(value);

    return `${PLACEHOLDER_PREFIX}${String(parameters.offset + parameters.values.length)}`;
  }
}
