import path from "node:path";

import { describe, expect, it } from "vitest";

import { ClosureTag } from "../../../testing/fixtures/trees/closure-tag.entity";
import { ListTag } from "../../../testing/fixtures/trees/list-tag.entity";
import { Widget } from "../../../testing/fixtures/widget.entity";
import { PluralSnakeNamingStrategy } from "../postgresql/postgresql.constants";

import { GraphEdgeError } from "./graph-entities.constants";
import {
  Dag,
  entityColumnNames,
  getGraphEdgeMetadata,
  Graph,
  GraphLabel,
  GraphSource,
  GraphTarget,
  GraphWeight,
  listGraphEdgeEntities,
  pickTreeCandidate,
  resolveEntityFiles,
  treeCandidates,
} from "./graph-entities.utilities";

import type { GraphTreeCandidate } from "./graph-entities.types";

const FIXTURE_TREES = path.join(
  import.meta.dirname,
  "../../../testing/fixtures/trees",
);

/** A tree candidate for one entity class, mapped to `tableName`. */
const tree = (
  entity: GraphTreeCandidate["entity"],
  tableName: string,
): GraphTreeCandidate => ({ entity, tableName });

@Dag()
@Graph()
class BothKindsEdge {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Dag()
class DagEdge {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Graph()
class DirectedEdge {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

abstract class EndpointBase {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;

  @GraphWeight()
  weight!: number;
}

@Graph({ directed: false })
class InheritingEdge extends EndpointBase {
  @GraphLabel()
  label!: string;
}

class InheritedKindEdge extends InheritingEdge {}

@Dag()
class MissingSourceEdge {
  @GraphTarget()
  target!: string;
}

@Graph()
class MissingTargetEdge {
  @GraphSource()
  source!: string;
}

class PlainEntity {
  source!: string;
  target!: string;
}

abstract class SourceBase {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Dag()
class RedeclaredSourceEdge extends SourceBase {
  @GraphSource()
  override source = "";
}

@Dag()
class RedeclaringSourceEdge extends SourceBase {
  @GraphSource()
  origin!: string;
}

@Graph()
class TwoLabelsEdge {
  @GraphLabel()
  name!: string;

  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;

  @GraphLabel()
  title!: string;
}

@Dag()
class TwoSourcesEdge {
  @GraphSource()
  origin!: string;

  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Dag()
class TwoTargetsEdge {
  @GraphTarget()
  destination!: string;

  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Graph()
class TwoWeightsEdge {
  @GraphWeight()
  cost!: number;

  @GraphWeight()
  distance!: number;

  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

class UndecoratedEdge {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Graph({ directed: false })
class UndirectedEdge {
  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

@Graph()
class WeightedLabeledEdge {
  @GraphWeight()
  cost!: number;

  @GraphLabel()
  label!: string;

  @GraphSource()
  source!: string;

  @GraphTarget()
  target!: string;
}

describe("graph entity utilities", () => {
  describe(entityColumnNames, () => {
    it("names the columns an entity declares itself, and those it inherits from its base layers", () => {
      const names = entityColumnNames(Widget);

      expect(names).toContain("displayName");
      expect(names).toContain("id");
      expect(names).toContain("createdAt");
      expect(names).toStrictEqual([...new Set(names)]);
    });

    it("names the columns of an entity that extends nothing", () => {
      expect(entityColumnNames(ListTag).toSorted()).toStrictEqual([
        "id",
        "name",
      ]);
    });
  });

  describe(treeCandidates, () => {
    it("lists each tree entity with the table its name maps to, skipping plain entities", () => {
      const candidates = treeCandidates(
        [ClosureTag, Widget, ListTag],
        new PluralSnakeNamingStrategy(),
      );

      expect(candidates).toStrictEqual([
        { entity: ClosureTag, tableName: "closure_tags" },
        { entity: ListTag, tableName: "list_tags" },
      ]);
    });

    it("lists no candidates when no entity is a tree", () => {
      expect(
        treeCandidates([Widget], new PluralSnakeNamingStrategy()),
      ).toStrictEqual([]);
    });
  });

  describe(pickTreeCandidate, () => {
    it("picks the only tree entity when --table is not given", () => {
      const only = tree(ClosureTag, "closure_tags");

      expect(pickTreeCandidate([only], undefined, ["a.ts"])).toBe(only);
    });

    it("picks the tree entity whose table --table names", () => {
      const closure = tree(ClosureTag, "closure_tags");
      const list = tree(ListTag, "list_tags");

      expect(pickTreeCandidate([closure, list], "list_tags", ["a.ts"])).toBe(
        list,
      );
    });

    it("fails naming every tree table when several match and --table is not given", () => {
      const candidates = [
        tree(ClosureTag, "closure_tags"),
        tree(ListTag, "list_tags"),
      ];

      expect(() => pickTreeCandidate(candidates, undefined, ["a.ts"])).toThrow(
        "Several @Tree entities match --entities: closure_tags, list_tags; name one with --table",
      );
    });

    it("fails when no tree entity matched the globs", () => {
      expect(() => pickTreeCandidate([], undefined, ["a.ts"])).toThrow(
        "No @Tree entity matched --entities a.ts",
      );
    });

    it("fails naming the trees found when --table names none of them", () => {
      expect(() =>
        pickTreeCandidate([tree(ClosureTag, "closure_tags")], "gadgets", [
          "a.ts",
        ]),
      ).toThrow(
        "No @Tree entity has table gadgets; the trees found are closure_tags",
      );
    });
  });

  describe(resolveEntityFiles, () => {
    it("resolves each glob to its files, sorted and without repeats", () => {
      const files = resolveEntityFiles([
        `${FIXTURE_TREES}/*.entity.ts`,
        `${FIXTURE_TREES}/closure-tag.entity.ts`,
      ]);

      expect(files.map((file) => path.basename(file))).toStrictEqual([
        "closure-tag.entity.ts",
        "list-tag.entity.ts",
        "path-tag.entity.ts",
        "set-tag.entity.ts",
      ]);
    });

    it("fails naming a glob that matches no file", () => {
      expect(() =>
        resolveEntityFiles([`${FIXTURE_TREES}/nothing-*.ts`]),
      ).toThrow("--entities matched no files: ");
    });
  });

  describe("graph edge utilities", () => {
    describe(getGraphEdgeMetadata, () => {
      it("records a DAG as directed with its source and target columns", () => {
        expect(getGraphEdgeMetadata(DagEdge)).toStrictEqual({
          directed: true,
          kind: "dag",
          sourceColumn: "source",
          targetColumn: "target",
        });
      });

      it("records a graph as directed by default", () => {
        expect(getGraphEdgeMetadata(DirectedEdge)).toStrictEqual({
          directed: true,
          kind: "graph",
          sourceColumn: "source",
          targetColumn: "target",
        });
      });

      it("records a graph declared undirected as undirected", () => {
        expect(getGraphEdgeMetadata(UndirectedEdge)).toStrictEqual({
          directed: false,
          kind: "graph",
          sourceColumn: "source",
          targetColumn: "target",
        });
      });

      it("records the label and weight columns when they are declared", () => {
        expect(getGraphEdgeMetadata(WeightedLabeledEdge)).toStrictEqual({
          directed: true,
          kind: "graph",
          labelColumn: "label",
          sourceColumn: "source",
          targetColumn: "target",
          weightColumn: "cost",
        });
      });

      it("inherits the endpoint, label, and weight properties from its base classes", () => {
        expect(getGraphEdgeMetadata(InheritingEdge)).toStrictEqual({
          directed: false,
          kind: "graph",
          labelColumn: "label",
          sourceColumn: "source",
          targetColumn: "target",
          weightColumn: "weight",
        });
      });

      it("inherits the kind of a decorated base class it does not decorate itself", () => {
        expect(getGraphEdgeMetadata(InheritedKindEdge)).toStrictEqual(
          getGraphEdgeMetadata(InheritingEdge),
        );
      });

      it("accepts a redeclared endpoint that keeps the base property name", () => {
        expect(getGraphEdgeMetadata(RedeclaredSourceEdge)).toStrictEqual({
          directed: true,
          kind: "dag",
          sourceColumn: "source",
          targetColumn: "target",
        });
      });

      it("rejects a class that is not decorated with @Dag or @Graph", () => {
        expect(() => getGraphEdgeMetadata(UndecoratedEdge)).toThrow(
          new GraphEdgeError(
            "UndecoratedEdge is not a graph edge: mark it with @Dag() or @Graph()",
          ),
        );
      });

      it("rejects a class marked with both @Dag and @Graph", () => {
        expect(() => getGraphEdgeMetadata(BothKindsEdge)).toThrow(
          new GraphEdgeError(
            "BothKindsEdge declares more than one of @Dag and @Graph; keep exactly one",
          ),
        );
      });

      it("rejects an edge with no @GraphSource property", () => {
        expect(() => getGraphEdgeMetadata(MissingSourceEdge)).toThrow(
          new GraphEdgeError(
            "MissingSourceEdge has no @GraphSource property; a @Dag or @Graph entity needs one",
          ),
        );
      });

      it("rejects an edge with no @GraphTarget property", () => {
        expect(() => getGraphEdgeMetadata(MissingTargetEdge)).toThrow(
          new GraphEdgeError(
            "MissingTargetEdge has no @GraphTarget property; a @Dag or @Graph entity needs one",
          ),
        );
      });

      it("rejects an edge that declares two @GraphSource properties", () => {
        expect(() => getGraphEdgeMetadata(TwoSourcesEdge)).toThrow(
          new GraphEdgeError(
            "TwoSourcesEdge declares several @GraphSource properties (origin, source); keep one",
          ),
        );
      });

      it("rejects an edge that declares two @GraphTarget properties", () => {
        expect(() => getGraphEdgeMetadata(TwoTargetsEdge)).toThrow(
          new GraphEdgeError(
            "TwoTargetsEdge declares several @GraphTarget properties (destination, target); keep one",
          ),
        );
      });

      it("rejects an edge that declares two @GraphLabel properties", () => {
        expect(() => getGraphEdgeMetadata(TwoLabelsEdge)).toThrow(
          new GraphEdgeError(
            "TwoLabelsEdge declares several @GraphLabel properties (name, title); keep one",
          ),
        );
      });

      it("rejects an edge that declares two @GraphWeight properties", () => {
        expect(() => getGraphEdgeMetadata(TwoWeightsEdge)).toThrow(
          new GraphEdgeError(
            "TwoWeightsEdge declares several @GraphWeight properties (cost, distance); keep one",
          ),
        );
      });

      it("rejects an endpoint redeclared under a new name beside the base's", () => {
        expect(() => getGraphEdgeMetadata(RedeclaringSourceEdge)).toThrow(
          new GraphEdgeError(
            "RedeclaringSourceEdge declares several @GraphSource properties (origin, source); keep one",
          ),
        );
      });
    });

    describe(listGraphEdgeEntities, () => {
      it("lists the classes decorated with @Dag or @Graph, inherited or not", () => {
        expect(
          listGraphEdgeEntities([
            PlainEntity,
            DagEdge,
            UndecoratedEdge,
            InheritedKindEdge,
            DirectedEdge,
          ]),
        ).toStrictEqual([DagEdge, InheritedKindEdge, DirectedEdge]);
      });

      it("keeps a class marked with both kinds, so reading it names the conflict", () => {
        expect(listGraphEdgeEntities([BothKindsEdge])).toStrictEqual([
          BothKindsEdge,
        ]);
      });
    });
  });
});
