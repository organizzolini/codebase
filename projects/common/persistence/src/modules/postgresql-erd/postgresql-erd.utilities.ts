import { glob } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getMetadataArgsStorage as getMetadataArgumentsStorage } from "typeorm";
import { z } from "zod";

import { withGeneratedEdges } from "../render/modules/render-entities/render-entities-generated.utilities";

import { readPostgresqlErdDerivedTables } from "./postgresql-erd-metadata.utilities";
import { renderPostgresqlErdSections } from "./postgresql-erd-sections.utilities";
import {
  POSTGRESQL_ERD_END_ANCHOR,
  POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA,
  POSTGRESQL_ERD_MODEL_SCHEMA,
  POSTGRESQL_ERD_RELATION_RESOLVER_SCHEMA,
  POSTGRESQL_ERD_RELATION_SYMBOLS,
  POSTGRESQL_ERD_START_ANCHOR,
  POSTGRESQL_ERD_TYPE_MAP,
  POSTGRESQL_ERD_VIEW_TITLES,
} from "./postgresql-erd.constants";

import type { GraphEntity } from "../render/modules/render-entities/render-entities.types";
import type {
  PostgresqlErdEntityClass,
  PostgresqlErdEntityDetails,
  PostgresqlErdMetadataStorage,
  PostgresqlErdModel,
} from "./postgresql-erd.types";

/** Returns whether the current markdown exactly matches the generated block. */
export function isPostgresqlErdMarkdownCurrent(
  content: string,
  model: PostgresqlErdModel,
): boolean {
  return splicePostgresqlErdMarkdown(content, model) === content;
}

/**
 * Imports matched files and returns validated entity metadata, adding external
 * relation targets as name-only entities.
 */
export async function readPostgresqlErdModel(
  fileGlobs: string[],
): Promise<PostgresqlErdModel> {
  const files = await findEntityFiles(fileGlobs);

  if (files.length === 0) {
    throw new Error("No entity file globs were provided.");
  }

  const entities = await importEntityFiles(files);

  if (entities.length === 0) {
    throw new Error(
      `No exported @Entity classes found in matched files for globs: ${fileGlobs.join(", ")}`,
    );
  }

  const storage = getMetadataArgumentsStorage();
  const entityModels = entities.map((entity) =>
    getEntityModel(entity, storage),
  );
  const derivedModels = await readPostgresqlErdDerivedTables(
    entities,
    new Map(
      entities.map((entity, index) => [
        entity,
        entityModels[index]?.tableName ?? entity.name,
      ]),
    ),
  );
  const entityNames = new Set(
    entityModels.flatMap(({ name, tableName }) => [name, tableName]),
  );
  const externalEntityNames = new Set<string>();

  for (const entity of entityModels) {
    for (const relation of entity.relations) {
      if (!entityNames.has(relation.target)) {
        externalEntityNames.add(relation.target);
      }
    }
  }

  return POSTGRESQL_ERD_MODEL_SCHEMA.parse({
    entities: [
      ...entityModels,
      ...derivedModels,
      ...[...externalEntityNames].toSorted().map((name) => ({ name })),
    ],
  });
}

/** Renders the validated model as Mermaid ER diagram source. */
export function renderPostgresqlErdModel(model: PostgresqlErdModel): string {
  const entities = model.entities.filter(isEntityDetails);
  const entityNames = new Map<string, string>();

  for (const { name, tableName } of entities) {
    entityNames.set(name, tableName);
    entityNames.set(tableName, tableName);
  }

  const relationships = entities.flatMap((entity) =>
    entity.relations.map((relation) =>
      renderRelationship(entity, relation, entityNames),
    ),
  );
  const definitions = model.entities.map((entity) =>
    isEntityDetails(entity)
      ? renderEntityDefinition(entity)
      : `  ${renderMermaidEntityName(entity.name)}`,
  );

  return ["erDiagram", "  direction LR", ...relationships, ...definitions].join(
    "\n",
  );
}

/**
 * Splices a fenced Mermaid diagram into its marker block, or appends the block
 * when the markdown has no anchors.
 */
export function splicePostgresqlErdMarkdown(
  content: string | undefined,
  model: PostgresqlErdModel,
): string {
  const block = [
    POSTGRESQL_ERD_START_ANCHOR,
    "",
    ...renderPostgresqlErdSections(model, renderPostgresqlErdModel),
    "",
    POSTGRESQL_ERD_END_ANCHOR,
  ].join("\n");

  if (content === undefined || content === "") {
    return `${block}\n`;
  }

  const segments = content.split(/(\r?\n)/);
  const anchorRange = findAnchorRange(segments);

  if (anchorRange === undefined) {
    return appendAnchoredBlock(content, segments, block);
  }

  return replaceAnchoredBlock(segments, anchorRange, block);
}

/** Appends the marker block after existing prose using its line endings. */
function appendAnchoredBlock(
  content: string,
  segments: string[],
  block: string,
): string {
  const lineBreak = findLineBreak(segments);
  const separator = content.endsWith("\n")
    ? lineBreak
    : `${lineBreak}${lineBreak}`;

  return `${content}${separator}${block.replaceAll("\n", lineBreak)}${lineBreak}`;
}

/** Finds anchor lines without changing their adjacent line endings. */
function findAnchorIndexes(segments: string[], anchor: string): number[] {
  return segments.flatMap((segment, index) =>
    index % 2 === 0 && segment.trim() === anchor ? [index] : [],
  );
}

/** Finds the unique ordered marker pair, refusing malformed documents. */
function findAnchorRange(
  segments: string[],
): undefined | { endIndex: number; startIndex: number } {
  const startIndexes = findAnchorIndexes(segments, POSTGRESQL_ERD_START_ANCHOR);
  const endIndexes = findAnchorIndexes(segments, POSTGRESQL_ERD_END_ANCHOR);

  if (startIndexes.length === 0 && endIndexes.length === 0) {
    return undefined;
  }

  const [startIndex] = startIndexes;
  const [endIndex] = endIndexes;

  if (
    startIndexes.length !== 1 ||
    endIndexes.length !== 1 ||
    startIndex === undefined ||
    endIndex === undefined ||
    endIndex < startIndex
  ) {
    throw new Error(
      `Markdown must contain one ordered pair of ${POSTGRESQL_ERD_START_ANCHOR} and ${POSTGRESQL_ERD_END_ANCHOR} markers.`,
    );
  }

  return { endIndex, startIndex };
}

/**
 * Finds each glob's resolved files and rejects a pattern that matched nothing.
 */
async function findEntityFiles(fileGlobs: string[]): Promise<string[]> {
  const files = new Set<string>();

  for (const pattern of fileGlobs) {
    const matches: string[] = [];

    for await (const file of glob(pattern)) {
      matches.push(path.resolve(file));
    }

    if (matches.length === 0) {
      throw new Error(`No files matched entity glob "${pattern}".`);
    }

    for (const match of matches) {
      files.add(match);
    }
  }

  return [...files].toSorted();
}

/** Uses a file's first existing line ending, defaulting to LF. */
function findLineBreak(segments: string[]): string {
  return (
    segments.find((segment, index) => index % 2 === 1 && segment.length > 0) ??
    "\n"
  );
}

/**
 * Reads column options or emitted property types across an entity's bases.
 */
function getEntityColumns(
  targets: PostgresqlErdEntityClass[],
  storage: PostgresqlErdMetadataStorage,
): PostgresqlErdEntityDetails["columns"] {
  return storage.columns
    .filter(({ target }) => {
      const parsedTarget = POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA.safeParse(target);

      return parsedTarget.success && targets.includes(parsedTarget.data);
    })
    .map((column) => {
      const reflectedType: unknown = isEntityClass(column.target)
        ? Reflect.getMetadata(
            "design:type",
            column.target.prototype,
            column.propertyName,
          )
        : undefined;
      const type: unknown = column.options.type ?? reflectedType;
      const parsedType = z
        .union([z.string(), POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA])
        .parse(type);

      return {
        name: column.options.name ?? column.propertyName,
        nullable: column.options.nullable ?? false,
        primaryKey: column.options.primary ?? false,
        type: typeof parsedType === "string" ? parsedType : parsedType.name,
      };
    })
    .toSorted(
      (left, right) =>
        Number(right.primaryKey) - Number(left.primaryKey) ||
        left.name.localeCompare(right.name),
    );
}

/**
 * Builds one entity record from TypeORM's decorator metadata.
 */
function getEntityModel(
  entity: PostgresqlErdEntityClass,
  storage: PostgresqlErdMetadataStorage,
): PostgresqlErdEntityDetails {
  const targets = getEntityTargets(entity);
  const table = storage.tables.find(({ target }) => target === entity);

  return {
    columns: getEntityColumns(targets, storage),
    ...(table?.type === "view"
      ? { kind: table.materialized === true ? "materialized-view" : "view" }
      : {}),
    name: entity.name,
    relations: getEntityRelations(targets, storage),
    tableName: table?.name ?? entity.name,
  };
}

/**
 * Reads relation cardinality and targets without traversing referenced entities.
 */
function getEntityRelations(
  targets: PostgresqlErdEntityClass[],
  storage: PostgresqlErdMetadataStorage,
): PostgresqlErdEntityDetails["relations"] {
  return storage.relations
    .filter(({ target }) => {
      const parsedTarget = POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA.safeParse(target);

      return parsedTarget.success && targets.includes(parsedTarget.data);
    })
    .map((relation) => ({
      cardinality: relation.relationType,
      name: relation.propertyName,
      target: getRelationTarget(relation.type),
    }))
    .toSorted((left, right) => left.name.localeCompare(right.name));
}

/**
 * Lists an entity and its base classes for inherited decorator lookup.
 */
function getEntityTargets(
  entity: PostgresqlErdEntityClass,
): PostgresqlErdEntityClass[] {
  const targets: PostgresqlErdEntityClass[] = [];
  let target: unknown = entity;

  while (isEntityClass(target) && target !== Function.prototype) {
    targets.push(target);
    target = Object.getPrototypeOf(target);
  }

  return targets;
}

/**
 * Resolves the class name returned by a relation target callback.
 */
function getRelationTarget(
  relationType: PostgresqlErdMetadataStorage["relations"][number]["type"],
): string {
  const relationTarget: unknown = relationType;
  const parsedTarget = z
    .union([z.string(), POSTGRESQL_ERD_RELATION_RESOLVER_SCHEMA])
    .parse(relationTarget);

  if (typeof parsedTarget === "string") {
    return parsedTarget;
  }

  const target: unknown = Reflect.apply(parsedTarget, undefined, []);

  return POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA.parse(target).name;
}

/**
 * Imports every matched file and keeps only its exported decorated entity classes.
 */
async function importEntityFiles(
  files: string[],
): Promise<PostgresqlErdEntityClass[]> {
  const storage = getMetadataArgumentsStorage();
  const entities: GraphEntity[] = [];

  for (const file of files) {
    const imported = z
      .record(z.string(), z.unknown())
      .parse(await import(pathToFileURL(file).href));

    for (const value of Object.values(imported)) {
      if (
        isGraphEntity(value) &&
        storage.tables.some(({ target }) => target === value)
      ) {
        entities.push(value);
      }
    }
  }

  // Edge entities a `@Graph` generates are exported from no file, so add them.
  return withGeneratedEdges([...new Set(entities)])
    .map((entity) => POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA.parse(entity))
    .toSorted((left, right) => left.name.localeCompare(right.name));
}

/**
 * Narrows decorator targets to class constructors.
 */
function isEntityClass(value: unknown): value is PostgresqlErdEntityClass {
  return typeof value === "function";
}

/** Narrows the model's union to entities with columns and relations. */
function isEntityDetails(
  entity: PostgresqlErdModel["entities"][number],
): entity is PostgresqlErdEntityDetails {
  return "columns" in entity;
}

/** Narrows an exported value to a class constructor. */
function isGraphEntity(value: unknown): value is GraphEntity {
  return typeof value === "function";
}

/** Adds Mermaid's key marker and explicit nullability comment to one column. */
function renderColumn(
  column: PostgresqlErdEntityDetails["columns"][number],
): string {
  const normalizedType = column.type.trim().toLowerCase();
  const type =
    POSTGRESQL_ERD_TYPE_MAP[normalizedType] ??
    (/^[a-z][a-z0-9_-]*$/u.test(normalizedType) ? normalizedType : "string");
  const normalizedName = column.name.replaceAll(/[\r\n]/gu, " ");
  const name = /^[A-Za-z_][A-Za-z0-9_-]*$/u.test(normalizedName)
    ? normalizedName
    : `\`${normalizedName.replaceAll("`", "_")}\``;
  const key = column.primaryKey ? " PK" : "";
  const nullability = column.nullable ? '"nullable"' : '"not nullable"';

  return `    ${type} ${name}${key} ${nullability}`;
}

/** Renders the attribute block for a full entity record. */
function renderEntityDefinition(entity: PostgresqlErdEntityDetails): string {
  const kind =
    entity.kind === undefined
      ? undefined
      : POSTGRESQL_ERD_VIEW_TITLES[entity.kind];
  const title =
    kind === undefined
      ? ""
      : `[${renderMermaidEntityName(`${entity.tableName} (${kind})`)}]`;

  return [
    `  ${renderMermaidEntityName(entity.tableName)}${title} {`,
    ...entity.columns.map((column) => renderColumn(column)),
    "  }",
  ].join("\n");
}

/** Quotes entity names with spaces or Mermaid syntax characters. */
function renderMermaidEntityName(name: string): string {
  if (/^[A-Za-z_][A-Za-z0-9_-]*$/u.test(name)) {
    return name;
  }

  return `"${name.replaceAll(/["%\\\r\n]/gu, "_")}"`;
}

/** Quotes relationship labels containing spaces or Mermaid syntax characters. */
function renderMermaidLabel(label: string): string {
  if (/^[A-Za-z_][A-Za-z0-9_-]*$/u.test(label)) {
    return label;
  }

  return `"${label.replaceAll(/["%\\\r\n]/gu, "_")}"`;
}

/** Renders a relation with table-name endpoints and Mermaid cardinality marks. */
function renderRelationship(
  entity: PostgresqlErdEntityDetails,
  relation: PostgresqlErdEntityDetails["relations"][number],
  entityNames: Map<string, string>,
): string {
  const target = entityNames.get(relation.target) ?? relation.target;

  return `  ${renderMermaidEntityName(entity.tableName)} ${POSTGRESQL_ERD_RELATION_SYMBOLS[relation.cardinality]} ${renderMermaidEntityName(target)} : ${renderMermaidLabel(relation.name)}`;
}

/** Replaces only the marker-delimited lines, preserving their surrounding text. */
function replaceAnchoredBlock(
  segments: string[],
  anchorRange: { endIndex: number; startIndex: number },
  block: string,
): string {
  const lineBreak = findLineBreak(segments);

  return [
    ...segments.slice(0, anchorRange.startIndex),
    block.replaceAll("\n", lineBreak),
    ...segments.slice(anchorRange.endIndex + 1),
  ].join("");
}
