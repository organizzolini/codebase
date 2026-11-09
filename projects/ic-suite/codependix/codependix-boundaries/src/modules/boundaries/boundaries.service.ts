import { Injectable } from "@nestjs/common";

import {
  describeCycle,
  describeDisallowedEdge,
  describeForbiddenEdge,
} from "./boundaries.constants";
import { BoundaryCyclesService } from "./boundary-cycles.service";
import { BoundarySelectorService } from "./boundary-selector.service";

import type {
  BoundaryEdge,
  BoundaryGraph,
  BoundaryNode,
  BoundaryViolation,
  EvaluateBoundariesArguments,
} from "./boundaries.types";
import type {
  CodependixBoundaryAccessRule,
  CodependixBoundaryAcyclicRule,
} from "@codependix/configuration";

/**
 * Judges a built graph against the rules declared for its level.
 *
 * Returns the edges and cycles that break the rules. A rule matching nothing is not an error,
 * so a rule for code yet to exist, or left behind after its code was deleted, reports nothing.
 * Depends only on `@codependix/configuration`, for the rule shapes.
 */
@Injectable()
export class BoundariesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly cyclesService: BoundaryCyclesService,
    private readonly selectorService: BoundarySelectorService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Turns one condemned edge into a violation charged to the source's project, where the
   * dependency is written and a fix belongs.
   */
  private buildAccessViolation(args: {
    edge: { source: string; target: string };
    graph: BoundaryGraph;
    nodes: Map<string, BoundaryNode>;
    rule: CodependixBoundaryAccessRule;
  }): BoundaryViolation {
    const { edge, graph, nodes, rule } = args;
    const describe =
      rule.kind === "forbid" ? describeForbiddenEdge : describeDisallowedEdge;

    return {
      cycle: undefined,
      level: graph.level,
      message: this.buildMessage({
        generated: describe({
          rule: rule.name,
          source: edge.source,
          target: edge.target,
        }),
        message: rule.message,
      }),
      projects: this.chargeProjects({ graph, ids: [edge.source], nodes }),
      rule: rule.name,
      scope: graph.scope,
      source: edge.source,
      target: edge.target,
    };
  }

  /**
   * The generated text, with the rule's `message` appended.
   *
   * Appended, not substituted, so the rule name and both edge ends always survive.
   */
  private buildMessage(args: {
    generated: string;
    message: string | undefined;
  }): string {
    return args.message === undefined
      ? args.generated
      : `${args.generated} ${args.message}`;
  }

  /**
   * Sorted and deduplicated. A node's own `project`, else the graph's `scope`, never the
   * workspace: a finding charged to no project fails no project.
   */
  private chargeProjects(args: {
    graph: BoundaryGraph;
    ids: readonly string[];
    nodes: Map<string, BoundaryNode>;
  }): string[] {
    const projects = new Set(
      args.ids.map(
        (id) => this.resolveNode(args.nodes, id).project ?? args.graph.scope,
      ),
    );

    return [...projects].toSorted((first, second) =>
      first.localeCompare(second),
    );
  }

  /**
   * Reports every edge an `allow` or `forbid` rule condemns.
   *
   * Both kinds share one traversal, differing only in the target's verdict.
   */
  private evaluateAccessRule(args: {
    graph: BoundaryGraph;
    rule: CodependixBoundaryAccessRule;
  }): BoundaryViolation[] {
    const { graph, rule } = args;
    const nodes = this.indexNodes(graph);
    const violations: BoundaryViolation[] = [];

    for (const edge of graph.edges) {
      if (!this.judgesEdge({ edge, rule })) {
        continue;
      }

      const source = this.resolveNode(nodes, edge.source);

      if (!this.selectorService.matches(source, rule.from)) {
        continue;
      }

      const target = this.resolveNode(nodes, edge.target);
      const reaches = this.selectorService.matches(target, rule.to);

      if (reaches !== (rule.kind === "forbid")) {
        continue;
      }

      violations.push(this.buildAccessViolation({ edge, graph, nodes, rule }));
    }

    return violations;
  }

  /**
   * Reports each cycle the selected nodes still form, charged to every project on it.
   * No one project can break a cycle alone.
   */
  private evaluateAcyclicRule(args: {
    graph: BoundaryGraph;
    rule: CodependixBoundaryAcyclicRule;
  }): BoundaryViolation[] {
    const { graph, rule } = args;
    const nodes = this.indexNodes(graph);
    const nodeIds = this.selectorService.selectIds(graph.nodes, rule.nodes);
    const cycles = this.cyclesService.findCycles({
      edges: graph.edges,
      nodeIds,
    });

    return cycles.map((cycle) => ({
      cycle: cycle.path,
      level: graph.level,
      message: this.buildMessage({
        generated: describeCycle({ cycle: cycle.path, rule: rule.name }),
        message: rule.message,
      }),
      projects: this.chargeProjects({ graph, ids: cycle.path, nodes }),
      rule: rule.name,
      scope: graph.scope,
      source: cycle.source,
      target: cycle.target,
    }));
  }

  /** Indexes a graph's nodes by identifier, so an edge can look its ends up. */
  private indexNodes(graph: BoundaryGraph): Map<string, BoundaryNode> {
    return new Map(graph.nodes.map((node) => [node.id, node]));
  }

  /**
   * Whether a rule judges this edge. `implicit: false` narrows it to explicit imports,
   * which is all `@nx/enforce-module-boundaries` sees.
   */
  private judgesEdge(args: {
    edge: BoundaryEdge;
    rule: CodependixBoundaryAccessRule;
  }): boolean {
    const wanted = args.rule.edges?.implicit;

    return wanted === undefined || (args.edge.implicit ?? false) === wanted;
  }

  /**
   * The node an edge names; when unlisted, a bare node with only its identifier, which
   * `path`, `project`, and `tags` selectors never match.
   */
  private resolveNode(
    nodes: Map<string, BoundaryNode>,
    id: string,
  ): BoundaryNode {
    return nodes.get(id) ?? { id };
  }

  // 🌎 Public Methods

  /**
   * Every violation one graph's rules report, in declaration order, so the report reads like the configuration.
   */
  public evaluate(args: EvaluateBoundariesArguments): BoundaryViolation[] {
    return args.rules.flatMap((rule) =>
      rule.kind === "acyclic"
        ? this.evaluateAcyclicRule({ graph: args.graph, rule })
        : this.evaluateAccessRule({ graph: args.graph, rule }),
    );
  }
}
