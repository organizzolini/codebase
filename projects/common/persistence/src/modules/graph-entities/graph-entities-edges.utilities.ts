// 🌎 Utilities

import {
  COMMAND_OF_KIND,
  DECORATOR_OF_KIND,
  graphEdgeWrongKindMessage,
  GraphEntitiesError,
  graphNoEdgeMessage,
  graphNoEdgeTableMessage,
  graphSeveralEdgesMessage,
} from "./graph-entities.constants";
import {
  entityTableName,
  getGraphEdgeDeclaration,
  listGraphEdgeEntities,
} from "./graph-entities.utilities";

import type {
  GraphEdgeCandidate,
  GraphEdgeKind,
  GraphEntity,
} from "./graph-entities.types";
import type { NamingStrategyInterface } from "typeorm";

/** The `@DirectedAcyclicGraph` and `@Graph` entities among `entities`, with their kind and table, in order. */
export function edgeCandidates(
  entities: readonly GraphEntity[],
  namingStrategy: NamingStrategyInterface,
): GraphEdgeCandidate[] {
  const candidates: GraphEdgeCandidate[] = [];
  for (const entity of listGraphEdgeEntities(entities)) {
    candidates.push({
      entity,
      kind: getGraphEdgeDeclaration(entity).kind,
      tableName: entityTableName(entity, namingStrategy),
    });
  }
  return candidates;
}

/** The one edge entity of `kinds` the command draws; `table` picks among several. */
export function pickEdgeCandidate(
  candidates: readonly GraphEdgeCandidate[],
  {
    command,
    globs,
    kinds,
    table,
  }: {
    readonly command: string;
    readonly globs: readonly string[];
    readonly kinds: readonly GraphEdgeKind[];
    readonly table: string | undefined;
  },
): GraphEdgeCandidate {
  const named = namedEdges(candidates, table, globs);
  return drawnEdge(named, command, kinds);
}

/**
 * The one of `named` of one of `kinds`.
 * @throws GraphEntitiesError when none, or several, is.
 */
function drawnEdge(
  named: readonly [GraphEdgeCandidate, ...GraphEdgeCandidate[]],
  command: string,
  kinds: readonly GraphEdgeKind[],
): GraphEdgeCandidate {
  const drawn = named.filter((candidate) => kinds.includes(candidate.kind));
  const [only, ...others] = drawn;
  if (only === undefined) {
    throw new GraphEntitiesError(
      graphEdgeWrongKindMessage(
        tableNames(named),
        command,
        COMMAND_OF_KIND[named[0].kind],
      ),
    );
  }
  if (others.length > 0) {
    throw new GraphEntitiesError(
      graphSeveralEdgesMessage(
        kinds.map((kind) => DECORATOR_OF_KIND[kind]),
        tableNames(drawn),
      ),
    );
  }
  return only;
}

/**
 * The edge entities `table` names, or all of them without it.
 * @throws GraphEntitiesError when there are none.
 */
function namedEdges(
  candidates: readonly GraphEdgeCandidate[],
  table: string | undefined,
  globs: readonly string[],
): [GraphEdgeCandidate, ...GraphEdgeCandidate[]] {
  const named =
    table === undefined
      ? candidates
      : candidates.filter((candidate) => candidate.tableName === table);
  const [first, ...rest] = named;
  if (first !== undefined) return [first, ...rest];

  throw new GraphEntitiesError(
    table === undefined
      ? graphNoEdgeMessage(globs)
      : graphNoEdgeTableMessage(table, tableNames(candidates)),
  );
}

/** The table name of each candidate, in order. */
function tableNames(candidates: readonly GraphEdgeCandidate[]): string[] {
  return candidates.map((candidate) => candidate.tableName);
}
