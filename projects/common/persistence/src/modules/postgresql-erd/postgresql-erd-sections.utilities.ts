import {
  fencedBlock,
  markdownText,
  slugger,
} from "../render/modules/render-mermaid/render-mermaid-sections.utilities";

import { POSTGRESQL_ERD_STANDALONE_TITLE } from "./postgresql-erd.constants";

import type {
  PostgresqlErdGroup,
  PostgresqlErdModel,
} from "./postgresql-erd.types";

/** One fenced diagram, or an index and a diagram per group of related tables. */
export function renderPostgresqlErdSections(
  model: PostgresqlErdModel,
  render: (model: PostgresqlErdModel) => string,
): string[] {
  const groups = groupPostgresqlErdTables(model);
  if (groups.length < 2) return [fencedBlock(render(model), "mermaid")];
  const slug = slugger();
  const links: string[] = [];
  const sections: string[] = [];
  for (const { entities, title } of groups) {
    links.push(`[${markdownText(title)}](#${slug(title)})`);
    sections.push(
      "",
      `## ${markdownText(title)}`,
      "",
      fencedBlock(render({ entities }), "mermaid"),
    );
  }
  return [links.join(" · "), ...sections];
}

/**
 * Joins the tables each relation connects: the table that represents a
 * table's group, and how many relations touch each table that has any.
 */
function connectTables(
  model: PostgresqlErdModel,
  tables: ReadonlyMap<string, string>,
): { degree: Map<string, number>; groupOf: (table: string) => string } {
  const parents = new Map<string, string>();
  const degree = new Map<string, number>();
  const groupOf = (table: string): string => {
    let top = table;
    for (
      let parent = parents.get(top);
      parent !== undefined && parent !== top;
      parent = parents.get(top)
    ) {
      top = parent;
    }
    return top;
  };
  for (const entity of model.entities) {
    if (!("relations" in entity)) continue;
    for (const relation of entity.relations) {
      const from = tableOf(entity);
      const to = tables.get(relation.target) ?? relation.target;
      parents.set(groupOf(from), groupOf(to));
      degree.set(from, (degree.get(from) ?? 0) + 1);
      degree.set(to, (degree.get(to) ?? 0) + 1);
    }
  }
  return { degree, groupOf };
}

/**
 * Splits the tables into groups joined by relations, in model order, with the
 * tables that have no relation gathered in one last group.
 */
function groupPostgresqlErdTables(
  model: PostgresqlErdModel,
): PostgresqlErdGroup[] {
  const { degree, groupOf } = connectTables(model, indexTables(model));
  const members = new Map<string, PostgresqlErdModel["entities"]>();
  for (const entity of model.entities) {
    const key = groupOf(tableOf(entity));
    members.set(key, [...(members.get(key) ?? []), entity]);
  }
  const related: PostgresqlErdGroup[] = [];
  const standalone: PostgresqlErdModel["entities"] = [];
  for (const entities of members.values()) {
    const [only] = entities;
    if (
      entities.length === 1 &&
      only !== undefined &&
      !degree.has(tableOf(only))
    ) {
      standalone.push(only);
    } else {
      related.push({ entities, title: groupTitle(entities, degree) });
    }
  }
  if (standalone.length > 0) {
    related.push({
      entities: standalone,
      title: POSTGRESQL_ERD_STANDALONE_TITLE,
    });
  }
  return related;
}

/** The most related table's name and the group's size, or the table's name alone. */
function groupTitle(
  entities: PostgresqlErdModel["entities"],
  degree: ReadonlyMap<string, number>,
): string {
  const names = new Set<string>();
  for (const entity of entities) names.add(tableOf(entity));
  let hub = "";
  let most = 0;
  for (const [name, count] of degree) {
    if (names.has(name) && count > most) {
      hub = name;
      most = count;
    }
  }
  return names.size === 1 ? hub : `${hub} (${names.size} tables)`;
}

/** Each table's name, whether the entity or its table is named: the table name. */
function indexTables(model: PostgresqlErdModel): Map<string, string> {
  const tables = new Map<string, string>();
  for (const entity of model.entities) {
    tables.set(entity.name, tableOf(entity));
    tables.set(tableOf(entity), tableOf(entity));
  }
  return tables;
}

/** The name an entity's relations are drawn against: its table name, else its name. */
function tableOf(entity: PostgresqlErdModel["entities"][number]): string {
  return "tableName" in entity ? entity.tableName : entity.name;
}
