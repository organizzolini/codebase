// 🏷️ Types

/**
 * One set of instance globs and the substitutions their template renders with.
 *
 * Directory and file patterns behave differently on purpose — see
 * `Instance.path`.
 */
export interface ConformetryInstanceGroup {
  /**
   * Workspace-relative globs naming paths that are never instances, such as
   * vendored shadcn components. Applies whether or not the group has tags.
   */
  exclude?: string[] | undefined;
  /**
   * Globs locating this group's instances, workspace-relative unless a host
   * resolves `tags` against each selected host. A group with only `tags` selects
   * without locating.
   */
  patterns?: string[] | undefined;
  /**
   * Values for every placeholder the template uses. A missing one renders as
   * empty rather than failing, so it is a silent hole.
   */
  substitutions?: Record<string, string> | undefined;
  /**
   * Labels selecting the hosts this group applies to, carried uninterpreted
   * here; `conformetry-nx` reads them as Nx project tags. No tags means everywhere.
   */
  tags?: string[] | undefined;
  /**
   * Lowest passing score for this group's instances, overriding the generator's
   * threshold. It lets one directory migrate at a lower bar.
   */
  threshold?: number | undefined;
}
