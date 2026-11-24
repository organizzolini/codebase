// ♟️ Constants

import { z } from "zod";

import type { GraphPaging } from "../render-options/render-options.types";

/** An edge row: endpoints as text, label and weight nullable. */
export const RENDER_EDGES_ROW_SCHEMA = z.object({
  label: z.string().nullable(),
  source: z.string().nullable(),
  target: z.string().nullable(),
  weight: z.number().nullable(),
});

/** A cycle among several nodes, named in sorted order. */
export const renderEdgesCycleMessage = (nodes: readonly string[]): string =>
  nodes.length === 1
    ? `Node ${nodes.join(", ")} has an edge to itself: a @DirectedAcyclicGraph must have no cycle`
    : `Cycle among nodes ${nodes.join(", ")}: a @DirectedAcyclicGraph must have no cycle`;

/** Edges dropped because an endpoint column held NULL. */
export const renderEdgesIgnoredMessage = (ignored: number): string =>
  `${ignored} ${ignored === 1 ? "edge has" : "edges have"} a NULL source or target, so ${ignored === 1 ? "it is" : "they are"} not drawn`;

/** A declared edge column that is not a column of the entity. */
export const renderEdgesColumnMessage = ({
  columns,
  decorator,
  entity,
  property,
}: {
  readonly columns: readonly string[];
  readonly decorator: string;
  readonly entity: string;
  readonly property: string;
}): string =>
  `${entity} marks ${property} with @${decorator}, but ${property} is not a column of ${entity}; columns are ${columns.join(", ")}`;

/** The warning for a page past the last root. */
export const renderEdgesPageMessage = (
  { limit, page }: GraphPaging,
  roots: number,
): string =>
  `Page ${String(page)} with --limit ${String(limit)} is past the last root: the graph has ${String(roots)} ${roots === 1 ? "root" : "roots"} in total, so nothing is drawn`;
