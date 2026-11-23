import { DataSource, Entity, PrimaryColumn } from "typeorm";
import { describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { Network } from "../../../../../testing/fixtures/graphs/generated/network.entity";
import { Station } from "../../../../../testing/fixtures/graphs/generated/station.entity";
import { PluralSnakeNamingStrategy } from "../../../postgresql/postgresql.constants";
import { withGeneratedEdges } from "../render-entities/render-entities-generated.utilities";
import { GraphLabel } from "../render-entities/render-entities.utilities";

import { RenderNodesService } from "./render-nodes.service";

import type { GraphEntity } from "../render-entities/render-entities.types";

class MetadataDataSource extends DataSource {
  async build(): Promise<void> {
    await this.buildMetadatas();
  }
}

@Entity({ name: "mislabelled" })
class Mislabelled {
  @PrimaryColumn({ type: "text" })
  code!: string;

  @GraphLabel()
  missing!: string;
}

/** A data source whose metadata is built for `entities` and their generated edges, never connected. */
async function metadataOf(
  entities: readonly GraphEntity[],
  schema?: string,
): Promise<MetadataDataSource> {
  const dataSource = new MetadataDataSource({
    entities: withGeneratedEdges(entities),
    namingStrategy: new PluralSnakeNamingStrategy(),
    type: "postgres",
    ...(schema === undefined ? {} : { schema }),
  });
  await dataSource.build();
  return dataSource;
}

describe(RenderNodesService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderNodesService);

    expect(instance).toBeInstanceOf(RenderNodesService);
  });

  it("asks for the label column of the ids, in the entity's schema, and drops a NULL label", async () => {
    const dataSource = await metadataOf([Network, Station], "fixture");
    const query = vi.spyOn(dataSource, "query").mockResolvedValue([
      { id: "1", label: "Alpha" },
      { id: "2", label: null },
    ]);

    const labels = await new RenderNodesService().labels(
      dataSource,
      dataSource.getMetadata(Station),
      ["1", "2"],
    );

    expect(query).toHaveBeenCalledExactlyOnceWith(
      'SELECT t."number"::text AS "id", t."title"::text AS "label" FROM "fixture"."stations" t WHERE t."number"::text = ANY($1::text[])',
      [["1", "2"]],
    );
    expect([...labels]).toStrictEqual([["1", "Alpha"]]);
  });

  it("reads no labels for an entity with no label column, and never queries", async () => {
    const dataSource = await metadataOf([Network, Station]);
    const query = vi.spyOn(dataSource, "query");
    const edge = withGeneratedEdges([Network]).find(
      ({ name }) => name === "NetworkLine",
    );

    const labels = await new RenderNodesService().labels(
      dataSource,
      dataSource.getMetadata(edge ?? Network),
      ["1"],
    );

    expect(labels.size).toBe(0);
    expect(query).not.toHaveBeenCalled();
  });

  it("names the entity whose label property is no column", async () => {
    const dataSource = await metadataOf([Mislabelled]);

    await expect(
      new RenderNodesService().labels(
        dataSource,
        dataSource.getMetadata(Mislabelled),
        ["a"],
      ),
    ).rejects.toThrow(
      "Mislabelled marks missing with @GraphLabel, but missing is not a column of Mislabelled; columns are code",
    );
  });
});
