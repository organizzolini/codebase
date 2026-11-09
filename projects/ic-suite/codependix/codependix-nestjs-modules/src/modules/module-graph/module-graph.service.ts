import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  MODULE_GRAPH_AMBIENT_LEGEND,
  MODULE_GRAPH_AMBIENT_MINIMUM_MODULES,
  MODULE_GRAPH_MERMAID_HEADER,
  MODULE_GRAPH_UNCONNECTED,
} from "./module-graph.constants";

import type { NestjsExploredModule } from "../nestjs-project/nestjs-project.types";
import type {
  NestjsModuleGraph,
  NestjsModuleGraphEdge,
  NestjsModuleGraphNode,
} from "./module-graph.types";

/**
 * Reduces an explored NestJS container into a graph and renders it.
 *
 * `NestjsProjectService.exploreProject` lists every `@Global()` module as an import of
 * every other module. Drawn literally, that buries the structure, so those edges are
 * left out and the global module is drawn as a rounded node on its own.
 */
@Injectable()
export class ModuleGraphService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Walks the tree into the edges worth drawing and the nodes they touch. */
  private collectEdgesAndNodes(
    tree: NestjsExploredModule[],
    ambientModuleNames: Set<string>,
  ): {
    connectedModuleNames: Set<string>;
    edges: NestjsModuleGraphEdge[];
    nodes: NestjsModuleGraphNode[];
  } {
    const nodes: NestjsModuleGraphNode[] = [];
    const connectedModuleNames = new Set<string>();
    const edges: NestjsModuleGraphEdge[] = [];

    const addNode = (name: string, declaringFile: string): void => {
      if (
        !nodes.some(
          (node) => node.name === name && node.declaringFile === declaringFile,
        )
      ) {
        nodes.push({ declaringFile, name });
      }
    };

    for (const node of tree) {
      addNode(node.name, node.declaringFile ?? "");
    }

    for (const node of tree) {
      for (const importedName of node.imports) {
        if (ambientModuleNames.has(importedName)) continue;

        edges.push({ source: node.name, target: importedName });
        connectedModuleNames.add(node.name);
        connectedModuleNames.add(importedName);

        const matchingTreeNode = tree.find(
          (candidate) => candidate.name === importedName,
        );
        addNode(importedName, matchingTreeNode?.declaringFile ?? "");
      }
    }

    return { connectedModuleNames, edges, nodes };
  }

  /** Sorts edges by source then target so the rendered diagram never churns. */
  private compareEdges(
    first: NestjsModuleGraphEdge,
    second: NestjsModuleGraphEdge,
  ): number {
    return (
      first.source.localeCompare(second.source) ||
      first.target.localeCompare(second.target)
    );
  }

  /** Sorts nodes by name then declaring file so the graph is stable. */
  private compareNodes(
    first: NestjsModuleGraphNode,
    second: NestjsModuleGraphNode,
  ): number {
    return (
      first.name.localeCompare(second.name) ||
      first.declaringFile.localeCompare(second.declaringFile)
    );
  }

  /** Counts how many modules import each module. */
  private countInboundEdges(tree: NestjsExploredModule[]): Map<string, number> {
    const inboundCounts = new Map<string, number>();

    for (const node of tree) {
      for (const importedName of node.imports) {
        inboundCounts.set(
          importedName,
          (inboundCounts.get(importedName) ?? 0) + 1,
        );
      }
    }

    return inboundCounts;
  }

  /**
   * Names modules imported by all the others, since a global module is registered into every module.
   */
  private findAmbientModuleNames(tree: NestjsExploredModule[]): Set<string> {
    const ambientModuleNames = new Set<string>();

    if (tree.length < MODULE_GRAPH_AMBIENT_MINIMUM_MODULES) {
      return ambientModuleNames;
    }

    for (const [moduleName, count] of this.countInboundEdges(tree)) {
      if (count >= tree.length - 1) {
        ambientModuleNames.add(moduleName);
      }
    }

    return ambientModuleNames;
  }

  /** Renders a module as a plain node, or a rounded one when it is ambient. */
  private renderNode(moduleName: string, graph: NestjsModuleGraph): string {
    return graph.ambientModuleNames.includes(moduleName)
      ? `${moduleName}([${moduleName}])`
      : moduleName;
  }

  /** Sorts names into a stable order. */
  private sortNames(names: Set<string> | string[]): string[] {
    return [...names].toSorted((first, second) => first.localeCompare(second));
  }

  // 🌎 Public Methods

  /** Reduces an explored container to a Graph of its module imports. */
  buildGraph(
    tree: NestjsExploredModule[],
    projectName: string,
  ): NestjsModuleGraph {
    const ambientModuleNames = this.findAmbientModuleNames(tree);
    const { connectedModuleNames, edges, nodes } = this.collectEdgesAndNodes(
      tree,
      ambientModuleNames,
    );
    const sortedNodes = nodes.toSorted((first, second) =>
      this.compareNodes(first, second),
    );
    const distinctModuleNames = this.sortNames(
      new Set(sortedNodes.map((node) => node.name)),
    );

    return {
      ambientModuleNames: this.sortNames(ambientModuleNames),
      edges: edges.toSorted((first, second) =>
        this.compareEdges(first, second),
      ),
      isolatedModuleNames: distinctModuleNames.filter(
        (moduleName) => !connectedModuleNames.has(moduleName),
      ),
      nodes: sortedNodes,
      projectName,
    };
  }

  /** Derives the project-relative folder a module belongs to from its declaring file. */
  deriveModuleFolder(node: NestjsModuleGraphNode): string {
    return path.posix.dirname(node.declaringFile.replaceAll("\\", "/"));
  }

  /** Renders a module graph as a fenced mermaid diagram. */
  renderMermaid(graph: NestjsModuleGraph): string {
    if (graph.nodes.length === 0) {
      return MODULE_GRAPH_UNCONNECTED;
    }

    const lines = [
      "```mermaid",
      MODULE_GRAPH_MERMAID_HEADER,
      ...graph.nodes.map((node) => `  ${this.renderNode(node.name, graph)}`),
      ...graph.edges.map((edge) => `  ${edge.source} --> ${edge.target}`),
      "```",
    ];

    if (graph.ambientModuleNames.length > 0) {
      lines.push("", MODULE_GRAPH_AMBIENT_LEGEND);
    }

    return lines.join("\n");
  }
}
