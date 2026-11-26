import { Injectable } from "@nestjs/common";

import { Tag } from "@codebase/caelundas-db";

import { tagMetadata } from "./modules/tag-metadata/tag-metadata.utilities";
import { tagNodeKey, tagPathKey, tagRank, tagSlug } from "./tags.utilities";

import type { KnownTags, TagPath } from "./tags.types";
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
   * Records a new node's slug among its siblings; throws when one has it.
   */
  private claimSlug(
    slugs: Map<string, string>,
    parentId: null | string,
    name: string,
  ): string {
    const slug = tagSlug(name);
    const key = tagNodeKey(parentId, slug);
    const sibling = slugs.get(key);

    if (sibling !== undefined) {
      throw new Error(
        `🚫 The tags "${sibling}" and "${name}" share the slug "${slug}" under ${parentId ?? "the root"}.`,
      );
    }
    slugs.set(key, name);

    return slug;
  }

  /**
   * The id of a path's last node, saving missing nodes on the way down and recording them in `known`.
   */
  private async ensurePath(
    manager: EntityManager,
    path: TagPath,
    known: KnownTags,
  ): Promise<string> {
    let parentId: null | string = null;
    let id = "";

    for (const [index, name] of path.entries()) {
      id =
        known.ids.get(tagNodeKey(parentId, name)) ??
        (await this.saveNode(
          manager,
          { parentId, path: path.slice(0, index + 1) },
          known,
        ));
      parentId = id;
    }

    return id;
  }

  /**
   * Saves the node a path ends in, under its parent, and returns its id.
   */
  private async saveNode(
    manager: EntityManager,
    node: { parentId: null | string; path: readonly string[] },
    known: KnownTags,
  ): Promise<string> {
    const { parentId, path } = node;
    const name = path.at(-1) ?? "";
    const slug = this.claimSlug(known.slugs, parentId, name);
    const { icon, note } = tagMetadata(path);
    const saved = await manager.getTreeRepository(Tag).save(
      manager.create(Tag, {
        icon,
        name,
        note,
        parent: parentId === null ? null : { id: parentId },
        rank: tagRank(path),
        slug,
      }),
    );
    known.ids.set(tagNodeKey(parentId, name), saved.id);

    return saved.id;
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
      select: { id: true, name: true, parentId: true, slug: true },
    });
    const known = {
      ids: new Map(
        stored.map((tag) => [
          tagNodeKey(tag.parentId ?? null, tag.name),
          tag.id,
        ]),
      ),
      slugs: new Map(
        stored.map((tag) => [
          tagNodeKey(tag.parentId ?? null, tag.slug),
          tag.name,
        ]),
      ),
    };
    const resolved = new Map<string, string>();

    for (const path of paths) {
      const key = tagPathKey(path);
      if (!resolved.has(key)) {
        resolved.set(key, await this.ensurePath(manager, path, known));
      }
    }

    return resolved;
  }
}
