import { Inject, Injectable } from "@nestjs/common";

import { GraphService } from "../../graph/graph.service";
import { BARE_MATRIX_POINT } from "../../matrix/matrix.constants";

import type { InkAdjacency } from "../../graph/graph.types";
import type { Matrix } from "../../matrix/matrix.types";
import type { CodeEdge, Connectivity } from "./connectivity.types";

/**
 * Reads a meander Matrix as a graph and reports its pieces, loops, and terminating points.
 *
 * A Matrix is one repeat of a band: east wraps from the last column to the first. An edge
 * exists when either end claims it.
 */
@Injectable()
export class ConnectivityService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(GraphService)
    private readonly graphService: GraphService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The Matrix's edges as an {@link InkAdjacency}, which is all {@link GraphService.components} needs of it. */
  private adjacency(
    matrix: Matrix,
    edges: readonly CodeEdge[],
  ): InkAdjacency<string> {
    const neighbors = new Map<string, string[]>();

    for (const { from, to } of edges) {
      neighbors.set(from, [...(neighbors.get(from) ?? []), to]);
      neighbors.set(to, [...(neighbors.get(to) ?? []), from]);
    }

    return {
      key: (node) => node,
      neighbors: (node) => neighbors.get(node) ?? [],
      nodes: this.nodes(matrix),
    };
  }

  /** How many of the Matrix's points are incident to exactly one edge, counting a self-loop's single point as incident twice. */
  private freeEnds(edges: readonly CodeEdge[]): number {
    const incidences = new Map<string, number>();
    const bump = (node: string): void => {
      incidences.set(node, (incidences.get(node) ?? 0) + 1);
    };

    for (const { from, to } of edges) {
      bump(from);
      bump(to);
    }

    return [...incidences.values()].filter((count) => count === 1).length;
  }

  /** Whether the southward edge leaving `(row, column)` is claimed by either of its two ends, reading past the last row as absent. */
  private joinsSouth(matrix: Matrix, row: number, column: number): boolean {
    const currentRow = matrix[row];
    const nextRow = matrix[row + 1];
    if (!currentRow || !nextRow) {
      return false;
    }

    const point = currentRow[column] ?? BARE_MATRIX_POINT;
    const below = nextRow[column] ?? BARE_MATRIX_POINT;

    return point.south || below.north;
  }

  /** One point's identity in the graph, which is its position and nothing else. */
  private key(row: number, column: number): string {
    return `${row},${column}`;
  }

  /** Every point the Matrix spells, inked dots included — a point on no edge at all is a component of its own. */
  private nodes(matrix: Matrix): string[] {
    const rows = matrix.length;
    const columns = matrix[0]?.length ?? 0;
    return Array.from({ length: rows }, (_unused, row) =>
      Array.from({ length: columns }, (_column, column) =>
        this.key(row, column),
      ),
    ).flat();
  }

  /**
   * How many pieces one repeat's ink falls into, how many independent loops it closes,
   * and how many of its points terminate.
   */
  connectivity(matrix: Matrix, unwrapped = false): Connectivity {
    const edges = this.edges(matrix, unwrapped);
    const adjacency = this.adjacency(matrix, edges);
    const components = this.graphService.components(adjacency);

    return {
      components,
      cycles: edges.length - adjacency.nodes.length + components,
      freeEnds: this.freeEnds(edges),
    };
  }

  /**
   * Every edge the Matrix holds, each once, as the pair of points it joins. East edges wrap; south edges stop at the last row.
   */
  edges(matrix: Matrix, unwrapped: boolean): CodeEdge[] {
    const rows = matrix.length;
    const columns = matrix[0]?.length ?? 0;
    if (rows === 0 || columns === 0) {
      return [];
    }
    const edges: CodeEdge[] = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const from = this.key(row, column);

        if (
          this.joinsEast(matrix, row, column) &&
          (!unwrapped || column !== columns - 1)
        ) {
          edges.push({ from, to: this.key(row, (column + 1) % columns) });
        }

        if (this.joinsSouth(matrix, row, column)) {
          edges.push({ from, to: this.key(row + 1, column) });
        }
      }
    }

    return edges;
  }

  // 🌎 Public Methods

  /** Whether the eastward edge leaving `column` is claimed by either of its two ends. */
  joinsEast(matrix: Matrix, row: number, column: number): boolean {
    const targetRow = matrix[row];
    if (!targetRow || targetRow.length === 0) {
      return false;
    }
    const columns = targetRow.length;
    const point = targetRow[column] ?? BARE_MATRIX_POINT;
    const eastward = targetRow[(column + 1) % columns] ?? BARE_MATRIX_POINT;

    return point.east || eastward.west;
  }
}
