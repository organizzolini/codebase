import { Injectable } from "@nestjs/common";

import { Tag } from "@codebase/caelundas-db";

import { tagMetadata } from "./modules/tag-metadata/tag-metadata.utilities";
import {
  tagEdgeKey,
  tagExtraParents,
  tagNodeKey,
  tagPathKey,
  tagRank,
  tagSlug,
} from "./tags.utilities";

import type { KnownTags, TagEdgeRow, TagPath } from "./tags.types";
import type { EntityManager } from "typeorm";

/**
 * Turns the paths events are classified under into nodes of the stored
 * `tags` graph, inserting any node or edge that is missing. A node declared
 * under several parents gets an edge from each.
 */
@Injectable()
export class TagsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Records the node among a parent's children, so a sibling with its name or slug is caught here and not by the database.
   */
  private claimSibling(
    known: KnownTags,
    parentId: string,
    node: { id: string; name: string },
  ): void {
    const named = known.ids.get(tagNodeKey(parentId, node.name));

    if (named !== undefined && named !== node.id) {
      throw new Error(
        `🚫 The tag "${node.name}" is already a different child of ${parentId}.`,
      );
    }
    this.claimSlug(known.slugs, parentId, node.name);
    known.ids.set(tagNodeKey(parentId, node.name), node.id);
  }

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
   * Gives the node an edge from each other parent its path declares, saving the parents on the way.
   */
  private async ensureExtraParents(
    manager: EntityManager,
    node: { id: string; path: TagPath },
    known: KnownTags,
  ): Promise<void> {
    const name = node.path.at(-1) ?? "";

    for (const parentPath of tagExtraParents(node.path)) {
      const parentId = await this.ensurePath(manager, parentPath, known);

      if (!known.edges.has(tagEdgeKey(parentId, node.id))) {
        this.claimSibling(known, parentId, { id: node.id, name });
        await manager
          .getRepository<TagEdgeRow>("TagEdge")
          .insert({ sourceNode: parentId, targetNode: node.id });
        known.edges.add(tagEdgeKey(parentId, node.id));
      }
    }
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
    await this.ensureExtraParents(manager, { id, path }, known);

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
    const saved = await manager.getRepository(Tag).save(
      manager.create(Tag, {
        icon,
        name,
        note,
        rank: tagRank(path),
        slug,
      }),
    );

    if (parentId !== null) {
      await manager
        .getRepository<TagEdgeRow>("TagEdge")
        .insert({ sourceNode: parentId, targetNode: saved.id });
      known.edges.add(tagEdgeKey(parentId, saved.id));
    }
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
      select: { id: true, name: true, slug: true },
    });
    const edges = await manager.getRepository<TagEdgeRow>("TagEdge").find();
    const parentsOf = new Map<string, string[]>();

    for (const { sourceNode, targetNode } of edges) {
      parentsOf.set(targetNode, [
        ...(parentsOf.get(targetNode) ?? []),
        sourceNode,
      ]);
    }

    const known: KnownTags = {
      edges: new Set(
        edges.map(({ sourceNode, targetNode }) =>
          tagEdgeKey(sourceNode, targetNode),
        ),
      ),
      ids: new Map(),
      slugs: new Map(),
    };

    // A node is found under each of its parents, or as a root when it has none.
    for (const tag of stored) {
      for (const parentId of parentsOf.get(tag.id) ?? [null]) {
        known.ids.set(tagNodeKey(parentId, tag.name), tag.id);
        known.slugs.set(tagNodeKey(parentId, tag.slug), tag.name);
      }
    }

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
