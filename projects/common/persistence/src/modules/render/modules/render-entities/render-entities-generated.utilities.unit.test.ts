import { DataSource, getMetadataArgsStorage, PrimaryColumn } from "typeorm";
import { describe, expect, it } from "vitest";

import { Job } from "../../../../../testing/fixtures/graphs/generated/job.entity";
import { Network } from "../../../../../testing/fixtures/graphs/generated/network.entity";
import { Pipeline } from "../../../../../testing/fixtures/graphs/generated/pipeline.entity";
import { Station } from "../../../../../testing/fixtures/graphs/generated/station.entity";
import { PluralSnakeNamingStrategy } from "../../../postgresql/postgresql.constants";

import {
  generatedEntitiesOf,
  isGraphEntity,
  withGeneratedEdges,
} from "./render-entities-generated.utilities";
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
    it("maps the generated entity to the table its name gives, with a key of both ends", async () => {
      const dataSource = await buildMetadata([Network, Station]);
      const metadata = edgeMetadata(dataSource, "NetworkLine");

      expect(metadata.tableName).toBe("network_lines");
      expect(
        metadata.primaryColumns.map(({ databaseName }) => databaseName),
      ).toStrictEqual(["source_node", "target_node"]);
      expect(
        metadata.columns.map(({ databaseName, type }) => [databaseName, type]),
      ).toStrictEqual([
        ["source_node", "integer"],
        ["target_node", "integer"],
      ]);
    });

    it("indexes each end under a name from the table and the end's column", async () => {
      const dataSource = await buildMetadata([Network, Station]);

      expect(
        edgeMetadata(dataSource, "NetworkLine").indices.map(
          ({ columns, name }) => [
            name,
            columns.map(({ databaseName }) => databaseName),
          ],
        ),
      ).toStrictEqual([
        ["network_lines_source_node", ["source_node"]],
        ["network_lines_target_node", ["target_node"]],
      ]);
    });

    it("relates the edge to its two stations, deleting with either", async () => {
      const dataSource = await buildMetadata([Network, Station]);
      const { foreignKeys } = edgeMetadata(dataSource, "NetworkLine");

      expect(
        foreignKeys.map(({ columnNames, onDelete, referencedTablePath }) => [
          columnNames,
          referencedTablePath,
          onDelete,
        ]),
      ).toStrictEqual([
        [["source_node"], "stations", "CASCADE"],
        [["target_node"], "stations", "CASCADE"],
      ]);
    });

    it("lets a station reach the edges it starts and ends", async () => {
      const dataSource = await buildMetadata([Network, Station]);

      expect(
        dataSource
          .getMetadata(Station)
          .oneToManyRelations.map(
            ({
              inverseEntityMetadata,
              inverseSidePropertyPath,
              propertyName,
            }) =>
              `${propertyName} -> ${inverseEntityMetadata.name}.${inverseSidePropertyPath}`,
          ),
      ).toStrictEqual([
        "incomingLines -> NetworkLine.target",
        "outgoingLines -> NetworkLine.source",
      ]);
    });

    it("copies the key type of text nodes onto a directed acyclic graph's edge", async () => {
      const dataSource = await buildMetadata([Pipeline, Job]);

      expect(
        edgeMetadata(dataSource, "PipelineDependency").columns.map(
          ({ databaseName, type }) => [databaseName, type],
        ),
      ).toStrictEqual([
        ["from_code", "text"],
        ["to_code", "text"],
      ]);
      expect(edgeMetadata(dataSource, "PipelineDependency").tableName).toBe(
        "pipeline_dependencies",
      );
    });

    it("names the columns of a graph that overrides them, and indexes them by those names", async () => {
      const dataSource = await buildMetadata([Pipeline, Job]);
      const metadata = edgeMetadata(dataSource, "PipelineDependency");

      expect(metadata.indices.map(({ name }) => name)).toStrictEqual([
        "pipeline_dependencies_from_code",
        "pipeline_dependencies_to_code",
      ]);
      expect(getGraphEdgeMetadata(Pipeline)).toMatchObject({
        sourceColumn: "fromCode",
        targetColumn: "toCode",
      });
    });

    it("lists only the edge and nodes a graph generated that the list lacks", () => {
      expect(
        generatedEntitiesOf([Network]).map(({ name }) => name),
      ).toStrictEqual(["NetworkLine", "Station"]);
      expect(
        generatedEntitiesOf([Network, Station]).map(({ name }) => name),
      ).toStrictEqual(["NetworkLine"]);
      expect(generatedEntitiesOf([Job, "other"])).toStrictEqual([]);
    });

    it("tells a class from anything else an entity list may hold", () => {
      expect(isGraphEntity(Network)).toBe(true);
      expect(isGraphEntity("jobs")).toBe(false);
    });

    it("names the generated columns by their property for --filter and --sort", () => {
      const edge = withGeneratedEdges([Network]).find(
        (entity) => entity.name === "NetworkLine",
      );

      expect(edge).toBeDefined();
      expect(entityColumnNames(edge ?? Network)).toStrictEqual([
        "sourceNode",
        "targetNode",
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
        kind: "graph",
        sourceColumn: "sourceNode",
        targetColumn: "targetNode",
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
        {
          enum: ["a", "b"],
          length: 8,
          name: "source_node",
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
          name: "target_node",
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
      ).toHaveLength(2);
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

    it("names a thrown value that is not an Error as its text", () => {
      expect(() => {
        @Graph({
          edge: "TextEdge",
          nodes: () => {
            const thrown: unknown = "not an error";
            throw thrown;
          },
        })
        class Texted {
          @PrimaryColumn({ type: "text" })
          id!: string;
        }
        return Texted;
      }).toThrow(
        new RenderEntitiesEdgeError(
          "@Graph edge TextEdge of Texted could not read its nodes() entity: not an error; import it before the graph, with no import cycle",
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
