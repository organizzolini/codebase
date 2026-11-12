import path from "node:path";

import { Injectable } from "@nestjs/common";

import type { BoundaryNode } from "./boundaries.types";
import type { CodependixBoundarySelector } from "@codependix/configuration";

/**
 * Decides which nodes a rule's selector claims. Has no opinion about rules: a selector and a node
 * go in, a yes or no comes out. Both rule kinds use it, and so could anything asking what a rule covers.
 */
@Injectable()
export class BoundarySelectorService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Whether a node attribute matches a list of globs. A selector naming an attribute the level lacks
   * matches nothing, not everything.
   */
  private matchesGlobs(
    value: string | undefined,
    globs: readonly string[] | undefined,
  ): boolean {
    if (globs === undefined) {
      return true;
    }

    if (value === undefined) {
      return false;
    }

    return globs.some((glob) => path.matchesGlob(value, glob));
  }

  /**
   * Whether a node tag matches a list of globs. One matching tag suffices, as in an Nx tag list.
   */
  private matchesTags(
    tags: readonly string[] | undefined,
    globs: readonly string[] | undefined,
  ): boolean {
    if (globs === undefined) {
      return true;
    }

    if (tags === undefined) {
      return false;
    }

    return globs.some((glob) =>
      tags.some((tag) => path.matchesGlob(tag, glob)),
    );
  }

  // 🌎 Public Methods

  /**
   * Whether a selector claims a node. Every stated field must match, so the fields narrow each other.
   * Within a field, one glob suffices.
   */
  public matches(
    node: BoundaryNode,
    selector: CodependixBoundarySelector,
  ): boolean {
    return (
      this.matchesGlobs(node.id, selector.id) &&
      this.matchesGlobs(node.path, selector.path) &&
      this.matchesGlobs(node.project, selector.project) &&
      this.matchesTags(node.tags, selector.tags)
    );
  }

  /**
   * The ids of every node a selector claims. An undefined selector claims all nodes;
   * the configuration schema refuses an empty one.
   */
  public selectIds(
    nodes: readonly BoundaryNode[],
    selector: CodependixBoundarySelector | undefined,
  ): Set<string> {
    if (selector === undefined) {
      return new Set(nodes.map((node) => node.id));
    }

    return new Set(
      nodes
        .filter((node) => this.matches(node, selector))
        .map((node) => node.id),
    );
  }
}
