import { Injectable } from "@nestjs/common";

import { Tag } from "@codebase/caelundas-db";

import { tagMetadata } from "./modules/tag-metadata/tag-metadata.utilities";
import { tagNodeKey, tagPathKey, tagRank } from "./tags.utilities";

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
   * The id of a path's last node, saving missing nodes on the way down and recording them in `ids`.
   */
  private async ensurePath(
    manager: EntityManager,
    path: TagPath,
    ids: Map<string, string>,
  ): Promise<string> {
    let parentId: null | string = null;
    let id = "";

    for (const [index, name] of path.entries()) {
      const key = tagNodeKey(parentId, name);
      const stored = ids.get(key);

      if (stored === undefined) {
        const parent = parentId === null ? null : { id: parentId };
        const { icon, note } = tagMetadata(path.slice(0, index + 1));
        const rank = tagRank(path.slice(0, index + 1));
        const saved = await manager
          .getTreeRepository(Tag)
          .save(manager.create(Tag, { icon, name, note, parent, rank }));
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
   * Maps each path to its last node's id, saving missing nodes in the caller's transaction. Concurrent runs may collide, so rerun.
   */
  async resolve(
    manager: EntityManager,
    paths: readonly TagPath[],
  ): Promise<Map<string, string>> {
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
