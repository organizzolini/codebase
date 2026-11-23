import path from "node:path";

import { describe, expect, it } from "vitest";

import { ClosureTag } from "../../../testing/fixtures/trees/closure-tag.entity";
import { ListTag } from "../../../testing/fixtures/trees/list-tag.entity";
import { Widget } from "../../../testing/fixtures/widget.entity";
import { PluralSnakeNamingStrategy } from "../postgresql/postgresql.constants";

import {
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

describe("graph entity utilities", () => {
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
});
