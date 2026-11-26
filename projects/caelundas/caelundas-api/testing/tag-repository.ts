import { Tag } from "@codebase/caelundas-db";

import type { DataSource, FindOptionsWhere } from "typeorm";

/** A tag to save, beneath each of its `parents`. */
export interface TagInput {
  name: string;
  parent?: Tag | undefined;
  parents?: readonly Tag[];
  slug: string;
}

/** What the tests use of a tag repository. */
export interface TagRepository {
  create: (input: TagInput) => TagInput;
  findOneByOrFail: (where: FindOptionsWhere<Tag>) => Promise<Tag>;
  save: (input: TagInput) => Promise<Tag>;
}

/**
 * Saves tags as a test reads them, `parent` or `parents` becoming `tag_edges`; refresh `tag_closures` before reading it.
 */
export function tagRepository(dataSource: DataSource): TagRepository {
  const tags = dataSource.getRepository(Tag);
  const edges = dataSource.getRepository<{
    sourceNode: string;
    targetNode: string;
  }>("TagEdge");

  return {
    create: (input) => input,
    findOneByOrFail: async (where) => tags.findOneByOrFail(where),
    save: async ({ name, parent, parents = [], slug }) => {
      const saved = await tags.save(tags.create({ name, slug }));

      for (const above of [
        ...(parent === undefined ? [] : [parent]),
        ...parents,
      ]) {
        await edges.insert({ sourceNode: above.id, targetNode: saved.id });
      }

      return saved;
    },
  };
}
