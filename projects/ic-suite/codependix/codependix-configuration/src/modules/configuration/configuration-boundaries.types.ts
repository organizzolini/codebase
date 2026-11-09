// 🏷️ Types

/**
 * Every declared boundary rule, keyed by the graph level it judges. Field by field, since
 * `Partial<Record>` would reject the unset value.
 */
export interface CodependixBoundariesConfiguration {
  fileImports?: CodependixFileImportsBoundariesConfiguration | undefined;
  nestjsModules?: CodependixBoundaryRule[] | undefined;
  nxProjects?: CodependixBoundaryRule[] | undefined;
}

/**
 * One rule stating which nodes may reach which. `forbid` reports edges from `from` to `to`;
 * `allow` reports edges from `from` to anything not `to`.
 */
export interface CodependixBoundaryAccessRule {
  /**
   * Narrows which edges the rule judges, rather than which nodes it selects.
   *
   * Left unset, the rule judges every edge between the nodes it selects.
   */
  edges?: CodependixBoundaryEdgeSelector | undefined;
  /** Selects the nodes the edge leaves. */
  from: CodependixBoundarySelector;
  kind: "allow" | "forbid";
  /**
   * Why the rule exists, appended to the generated sentence. Never substituted,
   * so the rule and both its ends always appear in the report.
   */
  message?: string | undefined;
  /** How the rule is named in a report, and in whatever asks about it. */
  name: string;
  /** Selects the nodes the edge arrives at. */
  to: CodependixBoundarySelector;
}

/**
 * One rule forbidding a cycle among a selected set of nodes. Narrow at file level, where
 * `dependency-cruiser`'s `no-circular` already gates.
 */
export interface CodependixBoundaryAcyclicRule {
  kind: "acyclic";
  /** Why the rule exists, appended to the generated sentence. */
  message?: string | undefined;
  /** How the rule is named in a report, and in whatever asks about it. */
  name: string;
  /**
   * Selects the nodes the rule covers; every node by default. A cycle is
   * reported only when all its nodes are selected.
   */
  nodes?: CodependixBoundarySelector | undefined;
}

/**
 * How a rule narrows which edges it judges. Separate from the node selector: only the Nx level draws
 * an edge worth narrowing on.
 */
export interface CodependixBoundaryEdgeSelector {
  /**
   * Judge only implicit (`true`) or only explicit (`false`) edges; unset judges
   * both. Only the Nx level has implicit edges.
   */
  implicit?: boolean | undefined;
}

/** One declared rule, of either kind. */
export type CodependixBoundaryRule =
  | CodependixBoundaryAccessRule
  | CodependixBoundaryAcyclicRule;

/**
 * A rule's node picker: globs matched against each stated field. A selector stating no field is
 * refused, not read as everything.
 */
export interface CodependixBoundarySelector {
  /** Globs matched against the node's identifier. */
  id?: string[] | undefined;
  /** Globs matched against the node's path, where its level carries one. */
  path?: string[] | undefined;
  /** Globs matched against the Nx project the node belongs to. */
  project?: string[] | undefined;
  /** Globs matched against the node's Nx tags; one tag matching is enough. */
  tags?: string[] | undefined;
}

/**
 * `boundaries.fileImports`'s rules, nested by language. Separate so authored and resolved shapes can both name it.
 */
export interface CodependixFileImportsBoundariesConfiguration {
  python?: CodependixBoundaryRule[] | undefined;
  typescript?: CodependixBoundaryRule[] | undefined;
}

/**
 * Every level's declared rules, resolved to an empty list when unset, so callers iterate every level unconditionally.
 */
export interface ResolvedCodependixBoundariesConfiguration {
  fileImports: ResolvedCodependixFileImportsBoundariesConfiguration;
  nestjsModules: CodependixBoundaryRule[];
  nxProjects: CodependixBoundaryRule[];
}

/** `fileImports`'s rules, resolved so both languages always resolve to a list. */
export interface ResolvedCodependixFileImportsBoundariesConfiguration {
  python: CodependixBoundaryRule[];
  typescript: CodependixBoundaryRule[];
}
