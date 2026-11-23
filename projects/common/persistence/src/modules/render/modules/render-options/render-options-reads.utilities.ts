// 🌎 Utilities

import { graphColumnKind } from "./render-options-columns.utilities";

import type { GraphColumn } from "./render-options.types";
import type { DataSource, EntityMetadata } from "typeorm";
import type { z } from "zod";

/** Escapes a name for SQL, the way the connection's driver quotes it. */
export function escapeName(dataSource: DataSource, name: string): string {
  return dataSource.driver.escape(name);
}

/** The columns of `metadata`, each with the kind its SQL type gives it. */
export function graphColumns(
  dataSource: DataSource,
  metadata: EntityMetadata,
): GraphColumn[] {
  const columns: GraphColumn[] = [];
  for (const column of metadata.columns) {
    columns.push({
      kind: graphColumnKind(dataSource.driver.normalizeType(column)),
      name: column.propertyName,
      sqlName: escapeName(dataSource, column.databaseName),
    });
  }
  return columns;
}

/**
 * Reads every row `body` selects, a page of `batchSize` at a time.
 * `body` ends in its ORDER BY.
 */
export async function selectPages<Schema extends z.ZodType>(
  dataSource: DataSource,
  {
    batchSize,
    body,
    parameters,
    schema,
  }: {
    readonly batchSize: number;
    readonly body: string;
    readonly parameters: readonly unknown[];
    readonly schema: Schema;
  },
): Promise<z.infer<Schema>[]> {
  const limit = parameters.length + 1;
  const rows: z.infer<Schema>[] = [];
  for (let offset = 0; ; offset += batchSize) {
    const page: unknown[] = await dataSource.query(
      `${body} LIMIT $${String(limit)} OFFSET $${String(limit + 1)}`,
      [...parameters, batchSize, offset],
    );
    for (const row of page) rows.push(schema.parse(row));
    if (page.length < batchSize) return rows;
  }
}
