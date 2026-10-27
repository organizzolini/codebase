import { Injectable } from "@nestjs/common";

import { Tag } from "../database/entities/tag.entity";

import { TAGS_LOCK_SQL } from "./tags.constants";
import { tagNodeKey, tagPathKey } from "./tags.utilities";

import type { TagPath } from "./tags.types";
import type { EntityManager } from "typeorm";

/**
 * Turns the paths events are classified under into nodes of the stored
 * `tags` tree, inserting any node that is missing.
 */
@Injectable()
export class TagsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The id of a path's last node, saving each missing node on the way down
   * through a tree repository, which adds its closure-table rows, and
   * recording it in `ids` for the paths after it.
   */
  private async ensurePath(
    manager: EntityManager,
    path: TagPath,
    ids: Map<string, string>,
  ): Promise<string> {
    let parentId: null | string = null;
    let id = "";

    for (const name of path) {
      const key = tagNodeKey(parentId, name);
      const stored = ids.get(key);

      if (stored === undefined) {
        const parent = parentId === null ? null : { id: parentId };
        const saved = await manager
          .getTreeRepository(Tag)
          .save(manager.create(Tag, { name, parent }));
        id = saved.id;
        ids.set(key, id);
      } else {
        id = stored;
      }

      parentId = id;
    }

    return id;
  }

  // 🌎 Public Methods

  /**
   * Maps each distinct path, by its {@link tagPathKey}, to the id of its last
   * node, through `manager`, so the nodes it inserts belong to the caller's
   * transaction. An event classified under the path is linked to that node.
   * The caller's transaction locks the `tags` table first, so concurrent
   * runs resolve one at a time.
   */
  async resolve(
    manager: EntityManager,
    paths: readonly TagPath[],
  ): Promise<Map<string, string>> {
    // 🔒 Held until the caller's transaction ends, so two runs never both
    // insert the same missing node and fail on its unique index.
    await manager.query<unknown>(TAGS_LOCK_SQL);

    const stored = await manager.getRepository(Tag).find({
      select: { id: true, name: true, parentId: true },
    });
    const ids = new Map(
      stored.map((tag) => [tagNodeKey(tag.parentId ?? null, tag.name), tag.id]),
    );
    const resolved = new Map<string, string>();

    for (const path of paths) {
      const key = tagPathKey(path);
      if (!resolved.has(key)) {
        resolved.set(key, await this.ensurePath(manager, path, ids));
      }
    }

    return resolved;
  }
}
