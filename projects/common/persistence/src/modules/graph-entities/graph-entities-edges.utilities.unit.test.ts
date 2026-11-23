import { describe, expect, it } from "vitest";

import { Widget } from "../../../testing/fixtures/widget.entity";
import { PluralSnakeNamingStrategy } from "../postgresql/postgresql.constants";

import {
  edgeCandidates,
  pickEdgeCandidate,
} from "./graph-entities-edges.utilities";
import { GraphEdgeError } from "./graph-entities.constants";
import {
  Dag,
  Graph,
  GraphSource,
  GraphTarget,
} from "./graph-entities.utilities";

import type { GraphEdgeCandidate } from "./graph-entities.types";

@Dag()
@Graph()
class BothLink {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Graph({ directed: false })
class GraphEdgeLink {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Graph()
class GraphLink {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Dag()
class StepLink {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Dag()
class TaskLink {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

const NAMING = new PluralSnakeNamingStrategy();
const GLOBS = ["src/**/*.entity.ts"];
const ALL = [TaskLink, StepLink, GraphLink];

/** A pick over `entities`, as the dag command makes it. */
const dagPick = (
  entities: readonly GraphEdgeCandidate["entity"][],
  table?: string,
): GraphEdgeCandidate["entity"] =>
  pickEdgeCandidate(edgeCandidates(entities, NAMING), {
    command: "render-dag-data",
    globs: GLOBS,
    kinds: ["dag"],
    table,
  }).entity;

describe("graph entities edge utilities", () => {
  describe(edgeCandidates, () => {
    it("lists each @Dag and @Graph entity with its kind and table, in the order given", () => {
      const candidates = edgeCandidates([TaskLink, Widget, GraphLink], NAMING);

      expect(candidates).toStrictEqual([
        { entity: TaskLink, kind: "dag", tableName: "task_links" },
        { entity: GraphLink, kind: "graph", tableName: "graph_links" },
      ]);
    });

    it("throws when a decorated entity declares both kinds", () => {
      expect(() => edgeCandidates([BothLink], NAMING)).toThrow(GraphEdgeError);
    });
  });

  describe(pickEdgeCandidate, () => {
    it("picks the only @Dag entity", () => {
      expect(dagPick([TaskLink])).toBe(TaskLink);
    });

    it("picks the @Dag entity when a @Graph entity is also found", () => {
      expect(dagPick([GraphLink, TaskLink])).toBe(TaskLink);
    });

    it("picks among several with --table", () => {
      expect(dagPick(ALL, "step_links")).toBe(StepLink);
    });

    it("fails naming every @Dag table when several match and --table is not given", () => {
      expect(() => dagPick(ALL)).toThrow(
        "Several @Dag entities match --entities: task_links, step_links; name one with --table",
      );
    });

    it("fails pointing to render-graph-data when only a @Graph entity is found", () => {
      expect(() => dagPick([GraphLink])).toThrow(
        "graph_links is not drawn by render-dag-data; use render-graph-data instead",
      );
    });

    it("names every table in the plural when only @Graph entities are found", () => {
      expect(() => dagPick([GraphLink, GraphEdgeLink])).toThrow(
        "graph_links, graph_edge_links are not drawn by render-dag-data; use render-graph-data instead",
      );
    });

    it("fails pointing to render-graph-data when --table names a @Graph entity", () => {
      expect(() => dagPick(ALL, "graph_links")).toThrow(
        "graph_links is not drawn by render-dag-data; use render-graph-data instead",
      );
    });

    it("fails when no edge entity is found", () => {
      expect(() => dagPick([Widget])).toThrow(
        "No @Dag or @Graph entity matched --entities src/**/*.entity.ts",
      );
    });

    it("fails when --table names a table no edge entity has", () => {
      expect(() => dagPick(ALL, "gadgets")).toThrow(
        "No @Dag or @Graph entity has table gadgets; the edge entities found are task_links, step_links, graph_links",
      );
    });
  });
});
