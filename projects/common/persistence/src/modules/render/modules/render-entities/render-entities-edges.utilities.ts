// 🌎 Utilities

import { generatedEdgeOf } from "./render-entities-generated.utilities";
import {
  COMMAND_OF_KIND,
  DECORATOR_OF_KIND,
  renderEntitiesEdgeWrongKindMessage,
  RenderEntitiesError,
  renderEntitiesNoEdgeMessage,
  renderEntitiesNoEdgeTableMessage,
  renderEntitiesSeveralEdgesMessage,
} from "./render-entities.constants";
import {
  entityTableName,
  getGraphEdgeDeclaration,
  listGraphEdgeEntities,
} from "./render-entities.utilities";

import type {
  GraphEdgeCandidate,
  GraphEdgeKind,
  GraphEntity,
} from "./render-entities.types";
import type { NamingStrategyInterface } from "typeorm";

/** The graph entities among `entities`, each with kind and table; a generated edge is listed under its graph's table. */
export function edgeCandidates(
  entities: readonly GraphEntity[],
  namingStrategy: NamingStrategyInterface,
): GraphEdgeCandidate[] {
  const candidates: GraphEdgeCandidate[] = [];
  for (const entity of listGraphEdgeEntities(entities)) {
    candidates.push({
      entity: generatedEdgeOf(entity)?.edge ?? entity,
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
 * @throws RenderEntitiesError when none, or several, is.
 */
function drawnEdge(
  named: readonly [GraphEdgeCandidate, ...GraphEdgeCandidate[]],
  command: string,
  kinds: readonly GraphEdgeKind[],
): GraphEdgeCandidate {
  const drawn = named.filter((candidate) => kinds.includes(candidate.kind));
  const [only, ...others] = drawn;
  if (only === undefined) {
    throw new RenderEntitiesError(
      renderEntitiesEdgeWrongKindMessage(
        tableNames(named),
        command,
        COMMAND_OF_KIND[named[0].kind],
      ),
    );
  }
  if (others.length > 0) {
    throw new RenderEntitiesError(
      renderEntitiesSeveralEdgesMessage(
        kinds.map((kind) => DECORATOR_OF_KIND[kind]),
        tableNames(drawn),
      ),
    );
  }
  return only;
}

/**
 * The edge entities `table` names, or all of them without it.
 * @throws RenderEntitiesError when there are none.
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

  throw new RenderEntitiesError(
    table === undefined
      ? renderEntitiesNoEdgeMessage(globs)
      : renderEntitiesNoEdgeTableMessage(table, tableNames(candidates)),
  );
}

/** The table name of each candidate, in order. */
function tableNames(candidates: readonly GraphEdgeCandidate[]): string[] {
  return candidates.map((candidate) => candidate.tableName);
}
