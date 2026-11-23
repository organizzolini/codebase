// 🌎 Utilities

import {
  RenderEntitiesEdgeError,
  renderEntitiesEdgeRecords,
  renderEntitiesEdgeSeveralMessage,
} from "./render-entities.constants";

import type {
  GraphEdgeDeclaration,
  GraphEdgeRecord,
  GraphEdgeRole,
  GraphEntity,
} from "./render-entities.types";

/** `entity` and each class it extends, nearest first, up to the first class with no base. */
export function classChain(entity: GraphEntity): object[] {
  const chain: object[] = [];
  for (
    let target: unknown = entity;
    typeof target === "function" && target !== Function.prototype;
    target = Object.getPrototypeOf(target)
  ) {
    chain.push(target);
  }
  return chain;
}

/** The declarations of the nearest class up the chain that has any. */
export function edgeDeclarationsOf(
  entity: GraphEntity,
): GraphEdgeDeclaration[] {
  for (const target of classChain(entity)) {
    const declarations =
      renderEntitiesEdgeRecords.get(target)?.declarations ?? [];
    if (declarations.length > 0) return declarations;
  }
  return [];
}

/**
 * The property names marked under `role` up the class chain, nearest class
 * first and without repeats, so a redeclared property counts once.
 */
export function edgePropertiesOf(
  entity: GraphEntity,
  role: GraphEdgeRole,
): string[] {
  const names = new Set<string>();
  for (const target of classChain(entity)) {
    for (const name of renderEntitiesEdgeRecords.get(target)?.properties[
      role
    ] ?? []) {
      names.add(name);
    }
  }
  return [...names];
}

/** The edge record for `target`, created empty on its first decorator. */
export function edgeRecordOf(target: object): GraphEdgeRecord {
  const existing = renderEntitiesEdgeRecords.get(target);
  if (existing !== undefined) return existing;

  const created: GraphEdgeRecord = {
    declarations: [],
    properties: {
      GraphLabel: [],
      GraphSource: [],
      GraphTarget: [],
      GraphWeight: [],
    },
  };
  renderEntitiesEdgeRecords.set(target, created);
  return created;
}

/**
 * The one property under `role`, or `undefined` when none is marked.
 * @throws RenderEntitiesEdgeError when several are marked.
 */
export function singleEdgeProperty(
  entity: GraphEntity,
  role: GraphEdgeRole,
): string | undefined {
  const names = edgePropertiesOf(entity, role);
  const [only, ...others] = names;
  if (others.length > 0) {
    throw new RenderEntitiesEdgeError(
      renderEntitiesEdgeSeveralMessage(entity.name, role, names.toSorted()),
    );
  }
  return only;
}
