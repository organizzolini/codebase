import { capturePlaceholderValues } from "@conformetry/configuration";
import { Injectable } from "@nestjs/common";

import { ScoringService } from "../scoring/scoring.service";

import { TypescriptNodesService } from "./typescript-nodes.service";

import type {
  CompareTreeArguments,
  TreeComparison,
  TypescriptComparisonError,
} from "./typescript.types";
import type { Node } from "typescript";

/**
 * Walks two syntax trees in parallel and reports what the template requires but the instance lacks.
 *
 * The template is a structural subset: the instance may add anything and order its members freely.
 */
@Injectable()
export class TypescriptTreeService {
  // 🏗 Dependency Injection

  constructor(
    private readonly scoringService: ScoringService,
    private readonly typeScriptNodesService: TypescriptNodesService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Describes a template node with no instance counterpart. */
  private buildError(args: {
    instanceNode: Node;
    nodeKey: null | string;
    templateChild: Node;
  }): TypescriptComparisonError {
    return {
      instancePosition: args.instanceNode.getStart(),
      kindLabel: this.typeScriptNodesService.readKindLabel(args.templateChild),
      nodeKey: args.nodeKey ?? undefined,
      templatePosition: args.templateChild.getStart(),
      weight: this.typeScriptNodesService.countSubtree(args.templateChild),
    };
  }

  /**
   * Descends into whichever candidate leaves the least of the template unaccounted for.
   *
   * Ranks by failed weight, not error count.
   */
  private compareBestCandidate(args: {
    candidates: { captures: Record<string, string>; node: Node }[];
    templateChild: Node;
  }): TreeComparison {
    return args.candidates
      .map((candidate) => {
        const comparison = this.compareTree({
          instanceNode: candidate.node,
          templateNode: args.templateChild,
        });

        // The node's own key comes before anything beneath it in the file.
        return {
          ...comparison,
          captures: { ...comparison.captures, ...candidate.captures },
        };
      })
      .reduce((best, candidate) => {
        return this.scoringService.sumWeights(candidate.differences) <
          this.scoringService.sumWeights(best.differences)
          ? candidate
          : best;
      });
  }

  /** Matches one template child against the instance's children. */
  private compareChild(args: {
    instanceChildren: Node[];
    instanceNode: Node;
    templateChild: Node;
  }): TreeComparison {
    const nodeKey = this.typeScriptNodesService.readKey(args.templateChild);
    const candidates = args.instanceChildren.flatMap((node) => {
      const captures =
        nodeKey === null
          ? this.matchKind({
              instanceChild: node,
              templateChild: args.templateChild,
            })
          : this.matchKey({
              instanceChild: node,
              nodeKey,
              templateChild: args.templateChild,
            });

      return captures === undefined ? [] : [{ captures, node }];
    });

    if (candidates.length === 0) {
      const error = this.buildError({
        instanceNode: args.instanceNode,
        nodeKey,
        templateChild: args.templateChild,
      });

      // The subtree is both what the finding costs and what was asked for:
      // nothing below a missing node can be compared, so the walk stops here
      // and counts the whole thing as required and absent.
      return { differences: [error], totalWeight: error.weight };
    }

    return this.compareBestCandidate({
      candidates,
      templateChild: args.templateChild,
    });
  }

  /**
   * Matches a template node on its key, returning placeholder captures.
   *
   * A placeholder key only matches nodes of the same syntax kind.
   */
  private matchKey(args: {
    instanceChild: Node;
    nodeKey: string;
    templateChild: Node;
  }): Record<string, string> | undefined {
    const instanceKey = this.typeScriptNodesService.readKey(args.instanceChild);

    if (instanceKey === args.nodeKey) {
      return {};
    }

    if (
      instanceKey === null ||
      args.instanceChild.kind !== args.templateChild.kind
    ) {
      return undefined;
    }

    return capturePlaceholderValues({
      instanceText: instanceKey,
      templateText: args.nodeKey,
    });
  }

  /** Matches a keyless template node on syntax kind alone. */
  private matchKind(args: {
    instanceChild: Node;
    templateChild: Node;
  }): Record<string, string> | undefined {
    return args.instanceChild.kind === args.templateChild.kind ? {} : undefined;
  }

  // 🌎 Public Methods

  /** Compares one level of two trees, descending into every match. */
  public compareTree(args: CompareTreeArguments): TreeComparison {
    const instanceChildren = this.typeScriptNodesService.readChildren(
      args.instanceNode,
    );

    return this.typeScriptNodesService
      .readChildren(args.templateNode)
      .map((templateChild) => {
        return this.compareChild({
          instanceChildren,
          instanceNode: args.instanceNode,
          templateChild,
        });
      })
      .reduce<TreeComparison>(
        (combined, comparison) => {
          return {
            // Earlier siblings win, so the first capture in the file stays.
            captures: { ...comparison.captures, ...combined.captures },
            differences: [...combined.differences, ...comparison.differences],
            totalWeight: combined.totalWeight + comparison.totalWeight,
          };
        },
        // The node itself is the one requirement its own level contributes;
        // its children add theirs.
        { differences: [], totalWeight: 1 },
      );
  }
}
