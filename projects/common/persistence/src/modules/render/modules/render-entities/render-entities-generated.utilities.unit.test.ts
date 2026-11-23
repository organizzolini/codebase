import { DataSource, getMetadataArgsStorage, PrimaryColumn } from "typeorm";
import { describe, expect, it } from "vitest";

import { Job } from "../../../../../testing/fixtures/graphs/generated/job.entity";
import { Network } from "../../../../../testing/fixtures/graphs/generated/network.entity";
import { Pipeline } from "../../../../../testing/fixtures/graphs/generated/pipeline.entity";
import { Station } from "../../../../../testing/fixtures/graphs/generated/station.entity";
import { PluralSnakeNamingStrategy } from "../../../postgresql/postgresql.constants";

import { withGeneratedEdges } from "./render-entities-generated.utilities";
import { RenderEntitiesEdgeError } from "./render-entities.constants";
import {
  DirectedAcyclicGraph,
  entityColumnNames,
  getGraphEdgeMetadata,
  Graph,
  GraphLabel,
  GraphSource,
  listGraphEdgeEntities,
} from "./render-entities.utilities";

import type { GraphEdgeOptions, GraphEntity } from "./render-entities.types";
import type { EntityMetadata } from "typeorm";

class MetadataDataSource extends DataSource {
  async build(): Promise<void> {
    await this.buildMetadatas();
  }
}

/** The metadata of every entity `entities` and their generated edges define. */
async function buildMetadata(
  entities: Parameters<typeof withGeneratedEdges>[0],
): Promise<MetadataDataSource> {
  const dataSource = new MetadataDataSource({
    entities: [...withGeneratedEdges(entities)],
    namingStrategy: new PluralSnakeNamingStrategy(),
    type: "postgres",
  });
  await dataSource.build();
  return dataSource;
}

/** The metadata of the generated entity named `name`. */
function edgeMetadata(dataSource: DataSource, name: string): EntityMetadata {
  const found = dataSource.entityMetadatas.find(
    (metadata) => metadata.name === name,
  );
  if (found === undefined) throw new Error(`No entity ${name}`);
  return found;
}

describe("generated edge entities", () => {
  describe("generating an edge entity", () => {
    it("maps the generated entity to the table its name gives, with a key of the graph and both ends", async () => {
      const dataSource = await buildMetadata([Network, Station]);
      const metadata = edgeMetadata(dataSource, "NetworkLine");

      expect(metadata.tableName).toBe("network_lines");
      expect(
        metadata.primaryColumns.map(({ databaseName }) => databaseName),
      ).toStrictEqual(["network_code", "from_number", "to_number"]);
      expect(
        metadata.columns.map(({ databaseName, type }) => [databaseName, type]),
      ).toStrictEqual([
        ["network_code", "text"],
        ["from_number", "integer"],
        ["to_number", "integer"],
      ]);
    });

    it("indexes each end under a name from the table and the end's key column", async () => {
      const dataSource = await buildMetadata([Network, Station]);

      expect(
        edgeMetadata(dataSource, "NetworkLine").indices.map(
          ({ columns, name }) => [
            name,
            columns.map(({ databaseName }) => databaseName),
          ],
        ),
      ).toStrictEqual([
        ["network_lines_from_number", ["from_number"]],
        ["network_lines_to_number", ["to_number"]],
      ]);
    });

    it("relates the edge to its graph and its two stations, deleting with any of them", async () => {
      const dataSource = await buildMetadata([Network, Station]);
      const { foreignKeys } = edgeMetadata(dataSource, "NetworkLine");

      expect(
        foreignKeys.map(({ columnNames, onDelete, referencedTablePath }) => [
          columnNames,
          referencedTablePath,
          onDelete,
        ]),
      ).toStrictEqual([
        [["network_code"], "networks", "CASCADE"],
        [["from_number"], "stations", "CASCADE"],
        [["to_number"], "stations", "CASCADE"],
      ]);
    });

    it("lets the graph reach its edges and a station reach the edges it starts and ends", async () => {
      const dataSource = await buildMetadata([Network, Station]);
      const reverse = (entity: typeof Network | typeof Station): string[] =>
        dataSource
          .getMetadata(entity)
          .oneToManyRelations.map(
            ({
              inverseEntityMetadata,
              inverseSidePropertyPath,
              propertyName,
            }) =>
              `${propertyName} -> ${inverseEntityMetadata.name}.${inverseSidePropertyPath}`,
          );

      expect(reverse(Network)).toStrictEqual(["lines -> NetworkLine.graph"]);
      expect(reverse(Station)).toStrictEqual([
        "incomingLines -> NetworkLine.target",
        "outgoingLines -> NetworkLine.source",
      ]);
    });

    it("saves a graph's edges with it: only the graph side cascades inserts", async () => {
      const dataSource = await buildMetadata([Network, Station]);
      const cascades = (entity: typeof Network | typeof Station): boolean[] =>
        dataSource
          .getMetadata(entity)
          .oneToManyRelations.map(({ isCascadeInsert }) => isCascadeInsert);

      expect(cascades(Network)).toStrictEqual([true]);
      expect(cascades(Station)).toStrictEqual([false, false]);
    });

    it("copies the key type of a text graph and its text nodes onto a directed acyclic graph's edge", async () => {
      const dataSource = await buildMetadata([Pipeline, Job]);

      expect(
        edgeMetadata(dataSource, "PipelineDependency").columns.map(
          ({ databaseName, type }) => [databaseName, type],
        ),
      ).toStrictEqual([
        ["pipeline_code", "text"],
        ["from_code", "text"],
        ["to_code", "text"],
      ]);
      expect(edgeMetadata(dataSource, "PipelineDependency").tableName).toBe(
        "pipeline_dependencies",
      );
    });

    it("names the generated columns by their property for --filter and --sort", () => {
      const edge = withGeneratedEdges([Network]).find(
        (entity) => entity.name === "NetworkLine",
      );

      expect(edge).toBeDefined();
      expect(entityColumnNames(edge ?? Network)).toStrictEqual([
        "networkCode",
        "fromNumber",
        "toNumber",
      ]);
    });

    it("adds the generated edge and the nodes once, whichever entities are listed", () => {
      const names = (
        entities: ReturnType<typeof withGeneratedEdges>,
      ): string[] => entities.map(({ name }) => name);

      expect(names(withGeneratedEdges([Network]))).toStrictEqual([
        "Network",
        "NetworkLine",
        "Station",
      ]);
      expect(
        names(withGeneratedEdges(withGeneratedEdges([Network, Station]))),
      ).toStrictEqual(["Network", "Station", "NetworkLine"]);
    });
  });

  describe("describing a generated edge entity", () => {
    it("reads the graph's direction, its kind, and the generated columns as the edge's", () => {
      const edge = withGeneratedEdges([Network]).find(
        (entity) => entity.name === "NetworkLine",
      );

      expect(getGraphEdgeMetadata(Network)).toStrictEqual({
        directed: false,
        generated: { edge, graph: Network, nodes: Station },
        kind: "graph",
        labelColumn: "networkCode",
        sourceColumn: "fromNumber",
        targetColumn: "toNumber",
      });
      expect(getGraphEdgeMetadata(edge ?? Network)).toStrictEqual(
        getGraphEdgeMetadata(Network),
      );
    });

    it("reads a directed acyclic graph's edge as directed", () => {
      expect(getGraphEdgeMetadata(Pipeline)).toMatchObject({
        directed: true,
        kind: "directed-acyclic-graph",
      });
    });

    it("lists the graph entity, never the generated edge, as the declaring entity", () => {
      expect(
        listGraphEdgeEntities(withGeneratedEdges([Network])),
      ).toStrictEqual([Network]);
    });
  });

  describe("refusing a graph that cannot generate its edge", () => {
    it("names the entity with no primary column", () => {
      expect(() => {
        @Graph({ edge: "OrphanEdge", nodes: () => Station })
        class NoKey {}
        return NoKey;
      }).toThrow(
        new RenderEntitiesEdgeError(
          "NoKey has 0 primary columns, so its @Graph edge OrphanEdge cannot reference it; give it exactly one",
        ),
      );
    });

    it("names a node entity whose primary key spans several columns", () => {
      class Compound {
        @PrimaryColumn({ type: "text" })
        first!: string;

        @PrimaryColumn({ type: "text" })
        second!: string;
      }

      expect(() => {
        @Graph({ edge: "CompoundEdge", nodes: () => Compound })
        class Cluster {
          @PrimaryColumn({ type: "text" })
          id!: string;
        }
        return Cluster;
      }).toThrow(
        new RenderEntitiesEdgeError(
          "Compound has 2 primary columns, so its @Graph edge CompoundEdge cannot reference it; give it exactly one",
        ),
      );
    });

    it("copies a key's size, enum, and transformer options and honors a table option", () => {
      const transformer = {
        from: (value: string) => value,
        to: (value: string) => value,
      };

      class Sized {
        @PrimaryColumn({
          enum: ["a", "b"],
          length: 8,
          precision: 4,
          scale: 2,
          transformer,
          type: "varchar",
          unsigned: true,
        })
        code!: string;
      }

      @Graph({ edge: "SizedEdge", nodes: () => Sized, table: "sized_links" })
      class SizedGraph {
        @PrimaryColumn({ type: "text" })
        id!: string;
      }

      const edge = withGeneratedEdges([SizedGraph]).find(
        ({ name }) => name === "SizedEdge",
      );
      const storage = getMetadataArgsStorage();

      expect(
        storage.filterColumns(edge ?? SizedGraph).map(({ options }) => options),
      ).toStrictEqual([
        { name: "sized_graph_id", primary: true, type: "text" },
        {
          enum: ["a", "b"],
          length: 8,
          name: "from_code",
          precision: 4,
          primary: true,
          scale: 2,
          transformer,
          type: "varchar",
          unsigned: true,
        },
        {
          enum: ["a", "b"],
          length: 8,
          name: "to_code",
          precision: 4,
          primary: true,
          scale: 2,
          transformer,
          type: "varchar",
          unsigned: true,
        },
      ]);
      expect(storage.filterTables(edge ?? SizedGraph)[0]?.name).toBe(
        "sized_links",
      );
    });

    it("replaces what an earlier load of the same graph registered, as a reloaded module does", () => {
      const define = (): GraphEntity => {
        @Graph({ edge: "ReloadedEdge", nodes: () => Station })
        class Reloaded {
          @PrimaryColumn({ type: "text" })
          id!: string;
        }
        return Reloaded;
      };

      define();
      define();
      const storage = getMetadataArgsStorage();
      const edges = storage.tables.filter(
        ({ target }) =>
          typeof target === "function" && target.name === "ReloadedEdge",
      );

      expect(edges).toHaveLength(1);
      expect(
        storage.columns.filter(({ target }) => target === edges[0]?.target),
      ).toHaveLength(3);
    });

    it("names the graph whose nodes() entity cannot be read when the decorator runs", () => {
      expect(() => {
        @Graph({
          edge: "LateEdge",
          nodes: () => {
            throw new Error("not defined yet");
          },
        })
        class Early {
          @PrimaryColumn({ type: "text" })
          id!: string;
        }
        return Early;
      }).toThrow(
        new RenderEntitiesEdgeError(
          "@Graph edge LateEdge of Early could not read its nodes() entity: not defined yet; import it before the graph, with no import cycle",
        ),
      );
    });

    it("refuses a class that generates two edges", () => {
      expect(() => {
        @Graph({ edge: "TwiceEdgeTwo", nodes: () => Station })
        @Graph({ edge: "TwiceEdgeOne", nodes: () => Station })
        class Twice {
          @PrimaryColumn({ type: "text" })
          id!: string;
        }
        return Twice;
      }).toThrow(
        new RenderEntitiesEdgeError(
          "Twice declares more than one of @DirectedAcyclicGraph and @Graph; keep exactly one",
        ),
      );
    });

    it("refuses an edge or node option given without the other", () => {
      const edgeOnly: GraphEdgeOptions & { readonly edge: string } = {
        edge: "HalfEdge",
      };

      expect(() => Graph(edgeOnly)).toThrow(
        new RenderEntitiesEdgeError(
          "@Graph names edge HalfEdge but no nodes; name both the edge and the nodes() entity, or neither",
        ),
      );
      expect(() =>
        DirectedAcyclicGraph({
          nodes: () => Station,
        }),
      ).toThrow(
        new RenderEntitiesEdgeError(
          "@DirectedAcyclicGraph names nodes but no edge; name both the edge and the nodes() entity, or neither",
        ),
      );
    });

    it("refuses to generate an edge a second time under a name that is taken", () => {
      expect(() => {
        @Graph({ edge: "NetworkLine", nodes: () => Station })
        class Duplicate {
          @PrimaryColumn({ type: "text" })
          id!: string;
        }
        return Duplicate;
      }).toThrow(
        new RenderEntitiesEdgeError(
          "@Graph edge NetworkLine of Duplicate collides with an entity or table that already exists; name the edge differently",
        ),
      );
    });

    it("refuses a graph that also marks its own edge columns", () => {
      expect(() => {
        @Graph({ edge: "MixedEdge", nodes: () => Station })
        class Mixed {
          @GraphLabel()
          label!: string;

          @GraphSource()
          source!: string;
        }
        return Mixed;
      }).toThrow(
        new RenderEntitiesEdgeError(
          "Mixed generates its edge MixedEdge, so it cannot mark @GraphSource properties of its own; use one form",
        ),
      );
    });
  });
});
