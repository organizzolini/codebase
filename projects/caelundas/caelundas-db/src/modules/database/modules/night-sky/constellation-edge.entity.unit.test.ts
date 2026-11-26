import { DataSource } from "typeorm";
import { describe, expect, it } from "vitest";

import { getGraphEdgeMetadata } from "@codebase/persistence";

import {
  DATABASE_ENTITIES,
  databaseDataSource,
} from "../../data-source.constants";

import { ConstellationEdge } from "./constellation-edge.entity";
import { Constellation } from "./constellation.entity";
import { Star } from "./star.entity";

import type { EntityMetadata, ValueTransformer } from "typeorm";

class MetadataDataSource extends DataSource {
  async build(): Promise<void> {
    await this.buildMetadatas();
  }
}

/** The metadata of the edge entity, built as the shared data source builds it. */
async function buildEdge(): Promise<{
  dataSource: MetadataDataSource;
  edge: EntityMetadata;
}> {
  const dataSource = new MetadataDataSource({
    ...databaseDataSource.options,
    entities: [...DATABASE_ENTITIES],
  });
  await dataSource.build();
  return { dataSource, edge: dataSource.getMetadata(ConstellationEdge) };
}

describe(ConstellationEdge, () => {
  it("maps the constellation_edges table, keyed by the constellation and both stars, typed as theirs", async () => {
    const { edge } = await buildEdge();

    expect(edge.tableName).toBe("constellation_edges");
    expect(
      edge.columns.map(({ databaseName, isPrimary, type }) => [
        databaseName,
        type,
        isPrimary,
      ]),
    ).toStrictEqual([
      ["constellation_id", "text", true],
      ["source_node", "bigint", true],
      ["target_node", "bigint", true],
    ]);
  });

  it("reads the star numbers back as numbers, as Star.hipparcosNumber does", async () => {
    const { dataSource, edge } = await buildEdge();
    const read = (
      column: EntityMetadata["columns"][number] | undefined,
    ): unknown[] =>
      [column?.transformer]
        .flat()
        .map((transformer: undefined | ValueTransformer): unknown =>
          transformer?.from("54061"),
        );

    expect(read(edge.findColumnWithPropertyName("sourceNode"))).toStrictEqual([
      54_061,
    ]);
    expect(
      read(
        dataSource
          .getMetadata(Star)
          .findColumnWithPropertyName("hipparcosNumber"),
      ),
    ).toStrictEqual([54_061]);
  });

  it("indexes each star and deletes the edge with its constellation or either star", async () => {
    const { edge } = await buildEdge();

    expect(edge.indices.map(({ name }) => name).toSorted()).toStrictEqual([
      "constellation_edges_source_node",
      "constellation_edges_target_node",
    ]);
    expect(
      edge.foreignKeys.map(({ columnNames, onDelete, referencedTablePath }) => [
        columnNames,
        referencedTablePath,
        onDelete,
      ]),
    ).toStrictEqual([
      [["constellation_id"], "caelundas.constellations", "CASCADE"],
      [["source_node"], "caelundas.stars", "CASCADE"],
      [["target_node"], "caelundas.stars", "CASCADE"],
    ]);
  });

  it("is reached from its constellation, saved with it, and from a star's two ends", async () => {
    const { dataSource } = await buildEdge();
    const reverse = (entity: typeof Constellation | typeof Star): string[] =>
      dataSource
        .getMetadata(entity)
        .oneToManyRelations.map(
          ({ inverseSidePropertyPath, isCascadeInsert, propertyName }) =>
            `${propertyName}.${inverseSidePropertyPath}:${String(isCascadeInsert)}`,
        );

    expect(reverse(Constellation)).toStrictEqual(["edges.constellation:true"]);
    expect(reverse(Star)).toStrictEqual([
      "incomingEdges.target:false",
      "outgoingEdges.source:false",
    ]);
  });

  it("is an undirected graph of stars, whose edges carry the designation as label", () => {
    expect(getGraphEdgeMetadata(ConstellationEdge)).toStrictEqual({
      directed: false,
      kind: "graph",
      labelColumn: "constellationId",
      sourceColumn: "sourceNode",
      targetColumn: "targetNode",
    });
  });
});
