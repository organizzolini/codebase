// 🏷️ Types

/**
 * Every declared boundary rule, keyed by the graph level it judges.
 *
 * Keyed the same way `CodependixProjectConfiguration` is, and written out
 * field by field for the same reason: under `exactOptionalPropertyTypes`,
 * `Partial<Record<...>>` makes a field optional without widening its type to
 * include `undefined`, which then rejects the "unset" value every
 * default-resolution path needs to assign.
 *
 * A flat array with a `graph` discriminant would also work, and was rejected:
 * it forces a reader to know which selector keys are legal at which level,
 * which the key already says.
 *
 * `fileImports` nests by language rather than flattening to one rule array:
 * a Python file cannot import a TypeScript file or vice versa, so no edge
 * ever crosses languages, and the rule vocabularies genuinely differ (a
 * `*.types.ts` naming convention has no Python equivalent). `nestjsModules`
 * and `nxProjects` keep the flat shape every other level always had.
 */
export interface CodependixBoundariesConfiguration {
  fileImports?: CodependixFileImportsBoundariesConfiguration | undefined;
  nestjsModules?: CodependixBoundaryRule[] | undefined;
  nxProjects?: CodependixBoundaryRule[] | undefined;
}

/**
 * One rule stating which nodes may reach which, at one graph level.
 *
 * `forbid` reports every edge whose source matches `from` and whose target
 * matches `to`. `allow` reports the mirror image — an edge leaving `from` for
 * anywhere `to` does not claim — so it states a node's whole permitted
 * surface rather than one thing it may not touch. Written as two `kind`s of
 * one rule rather than two rule types, because a reader comparing them wants
 * to see the same three fields either way.
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
   * Why the rule exists, appended to the generated sentence.
   *
   * Appended rather than substituted, so no wording a configuration chooses
   * can cost a report the rule that fired and both ends of what it fired on.
   */
  message?: string | undefined;
  /** How the rule is named in a report, and in whatever asks about it. */
  name: string;
  /** Selects the nodes the edge arrives at. */
  to: CodependixBoundarySelector;
}

/**
 * One rule forbidding a cycle among a selected set of nodes.
 *
 * Deliberately narrow at TypeScript file level, where `dependency-cruiser`'s
 * `no-circular` is already the workspace's gate — see
 * `configuration/dependency-cruiser.cjs`. At Nx project level and NestJS
 * module level nothing else states it, which is where this earns its place.
 */
export interface CodependixBoundaryAcyclicRule {
  kind: "acyclic";
  /** Why the rule exists, appended to the generated sentence. */
  message?: string | undefined;
  /** How the rule is named in a report, and in whatever asks about it. */
  name: string;
  /**
   * Selects the nodes the rule covers, defaulting to every node in the graph.
   *
   * A cycle is only reported when every node in it is selected: a rule scoped
   * to one directory should not fail because of a cycle running through code
   * it was never asked about.
   */
  nodes?: CodependixBoundarySelector | undefined;
}

/**
 * How a rule narrows which edges it judges.
 *
 * Separate from `CodependixBoundarySelector`, which picks the nodes at either
 * end: this is about the edge itself, and only the Nx level draws an edge with
 * an attribute worth narrowing on.
 */
export interface CodependixBoundaryEdgeSelector {
  /**
   * Judge only implicit edges, or only explicit ones.
   *
   * `false` is what makes a rule mean exactly what an
   * `@nx/enforce-module-boundaries` `depConstraint` means: that rule reads
   * import statements, so an `implicitDependencies` entry is invisible to it.
   * `true` inverts it — useful for finding the edges declared in
   * configuration that no import backs. Unset judges both, which is the
   * stricter reading and the right default for a rule about what a project
   * may depend on rather than about what it may import.
   *
   * Every level that is not `nx` draws only explicit edges, so a rule naming
   * `implicit: true` there selects nothing.
   */
  implicit?: boolean | undefined;
}

/** One declared rule, of either kind. */
export type CodependixBoundaryRule =
  | CodependixBoundaryAccessRule
  | CodependixBoundaryAcyclicRule;

/**
 * How a rule picks the nodes at one end of an edge.
 *
 * Four vocabularies, one node shape: an Nx project is selected by name or by
 * tag, a file by its project-relative path, a NestJS module only by its class
 * name — see `NestjsModuleGraph`, which carries no file path at all. Every
 * field is a list of globs, matched with `path.matchesGlob`, and a node
 * matches the selector when it matches every field the selector states.
 * Within one field, one glob matching is enough.
 *
 * A selector stating no field at all is refused rather than read as "every
 * node": the two are indistinguishable in a configuration file, and reading
 * it as everything turns a typo into a rule that judges the whole workspace.
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
 * `boundaries.fileImports`'s rules, nested by language.
 *
 * Separate from `CodependixBoundariesConfiguration` so both the authored and
 * resolved shapes (see `ResolvedCodependixFileImportsBoundariesConfiguration`)
 * can name it once rather than repeating the two-field object inline.
 */
export interface CodependixFileImportsBoundariesConfiguration {
  python?: CodependixBoundaryRule[] | undefined;
  typescript?: CodependixBoundaryRule[] | undefined;
}

/**
 * Every graph level's declared rules, with a level naming none resolved to an
 * empty list rather than left unset — so a caller iterates every level
 * without asking whether each one was configured.
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
