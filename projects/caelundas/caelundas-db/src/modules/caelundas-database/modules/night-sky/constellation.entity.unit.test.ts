import { DataSource } from "typeorm";
import { describe, expect, it } from "vitest";

import { getGraphEdgeMetadata } from "@codebase/persistence";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  caelundasDataSource,
} from "../../data-source.constants";

import { Constellation } from "./constellation.entity";
import { Star } from "./star.entity";

import type { EntityMetadata } from "typeorm";

class MetadataDataSource extends DataSource {
  async build(): Promise<void> {
    await this.buildMetadatas();
  }
}

/** The metadata of the generated edge entity, built as the shared data source builds it. */
async function buildEdge(): Promise<{
  dataSource: MetadataDataSource;
  edge: EntityMetadata;
}> {
  const dataSource = new MetadataDataSource({
    ...caelundasDataSource.options,
    entities: [...CAELUNDAS_DATABASE_ENTITIES],
  });
  await dataSource.build();
  const edge = dataSource.entityMetadatas.find(
    ({ name }) => name === "ConstellationEdge",
  );
  if (edge === undefined) throw new Error("No ConstellationEdge entity");
  return { dataSource, edge };
}

describe(Constellation, () => {
  it("generates the constellation_edges table, keyed by the constellation and both stars, typed as theirs", async () => {
    const { edge } = await buildEdge();

    expect(edge.tableName).toBe("constellation_edges");
    expect(
      edge.columns.map(({ databaseName, isPrimary, type }) => [
        databaseName,
        type,
        isPrimary,
      ]),
    ).toStrictEqual([
      ["constellation_designation", "text", true],
      ["from_hip", "bigint", true],
      ["to_hip", "bigint", true],
    ]);
  });

  it("reads the star numbers back as numbers, as Star.hip does", async () => {
    const { dataSource, edge } = await buildEdge();
    const hip = dataSource.getMetadata(Star).findColumnWithPropertyName("hip");
    const from = edge.findColumnWithPropertyName("fromHip");

    expect(from?.transformer).toStrictEqual(hip?.transformer);
    expect(from?.transformer).toBeDefined();
  });

  it("indexes each star and deletes the edge with its constellation or either star", async () => {
    const { edge } = await buildEdge();

    expect(edge.indices.map(({ name }) => name)).toStrictEqual([
      "constellation_edges_from_hip",
      "constellation_edges_to_hip",
    ]);
    expect(
      edge.foreignKeys.map(({ columnNames, onDelete, referencedTablePath }) => [
        columnNames,
        referencedTablePath,
        onDelete,
      ]),
    ).toStrictEqual([
      [["constellation_designation"], "caelundas.constellations", "CASCADE"],
      [["from_hip"], "caelundas.stars", "CASCADE"],
      [["to_hip"], "caelundas.stars", "CASCADE"],
    ]);
  });

  it("reaches its edges, saved with it, and a star reaches the edges it starts and ends", async () => {
    const { dataSource } = await buildEdge();
    const reverse = (entity: typeof Constellation | typeof Star): string[] =>
      dataSource
        .getMetadata(entity)
        .oneToManyRelations.map(
          ({ inverseSidePropertyPath, isCascadeInsert, propertyName }) =>
            `${propertyName}.${inverseSidePropertyPath}:${String(isCascadeInsert)}`,
        );

    expect(reverse(Constellation)).toStrictEqual(["edges.graph:true"]);
    expect(reverse(Star)).toStrictEqual([
      "incomingEdges.target:false",
      "outgoingEdges.source:false",
    ]);
  });

  it("is an undirected graph of stars, whose edges carry the designation as label", () => {
    const metadata = getGraphEdgeMetadata(Constellation);

    expect(metadata).toMatchObject({
      directed: false,
      kind: "graph",
      labelColumn: "constellationDesignation",
      sourceColumn: "fromHip",
      targetColumn: "toHip",
    });
    expect(metadata.generated?.nodes).toBe(Star);
    expect(metadata.generated?.graph).toBe(Constellation);
  });
});
