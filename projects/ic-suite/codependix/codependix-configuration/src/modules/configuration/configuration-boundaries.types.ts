// 🏷️ Types

/** Rules per graph level, field by field; `Partial<Record>` rejects unset. */
export interface CodependixBoundariesConfiguration {
  fileImports?: CodependixFileImportsBoundariesConfiguration | undefined;
  nestjsModules?: CodependixBoundaryRule[] | undefined;
  nxProjects?: CodependixBoundaryRule[] | undefined;
}

/** `forbid`: edges `from` to `to`. `allow`: edges `from` to anything else. */
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

/** Forbids a cycle among selected nodes; file level has `no-circular`. */
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

/** Narrows judged edges; only the Nx level needs it. */
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

/** Globs per field; an empty selector is refused, not universal. */
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

/** `boundaries.fileImports` rules by language, shared by both shapes. */
export interface CodependixFileImportsBoundariesConfiguration {
  python?: CodependixBoundaryRule[] | undefined;
  typescript?: CodependixBoundaryRule[] | undefined;
}

/** Each level's rules, empty when unset, so callers need not check. */
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
