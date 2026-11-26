import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

import { BLOCKED_TAGS_SQL } from "./tag-flags.constants";
import {
  keepLevel,
  sanitizeFilter,
  sanitizeLevels,
} from "./tag-flags.utilities";

import type { BlockedTags, TagInputs } from "./tag-flags.types";

/**
 * Drops, silently, the tags a query names that the menus leave out: a filter value, a group level or a color level whose tag has a false flag is ignored, never an error.
 */
@Injectable()
export class TagFlagsService {
  // 🏗 Dependency Injection

  constructor(@InjectEntityManager() private readonly manager: EntityManager) {}

  // 🔏 Private Methods

  /**
   * The ids of the tags a false flag keeps out of filters and of groupings.
   */
  private async findBlocked(): Promise<BlockedTags> {
    const rows =
      await this.manager.query<
        { id: string; is_filterable: boolean; is_groupable: boolean }[]
      >(BLOCKED_TAGS_SQL);
    const filter = new Set<string>();
    const group = new Set<string>();

    for (const row of rows) {
      if (!row.is_filterable) {
        filter.add(row.id);
      }

      if (!row.is_groupable) {
        group.add(row.id);
      }
    }

    return { filter, group };
  }

  // 🌎 Public Methods

  /**
   * The same inputs without the tags a flag keeps out; reads the flags only when there is a filter or a grouping to clean.
   */
  public async sanitize(inputs: Readonly<TagInputs>): Promise<TagInputs> {
    const { colorBy, filter, levels } = inputs;
    const present = [colorBy, filter, levels].some(
      (input) => input !== null && input !== undefined,
    );

    if (!present) {
      return inputs;
    }

    const blocked = await this.findBlocked();

    return {
      colorBy: keepLevel(colorBy, blocked.group) ?? null,
      filter: sanitizeFilter(filter, blocked.filter),
      levels: sanitizeLevels(levels, blocked.group),
    };
  }
}
