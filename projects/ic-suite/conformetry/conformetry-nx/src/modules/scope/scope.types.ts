// 🏷️ Types

import type {
  ConformetryGeneratorDefinition,
  ConformetryInstanceGroup,
} from "@conformetry/configuration";

/**
 * The configuration as this plugin reads it. Authors type theirs this way so
 * instance groups are checked against what Nx can resolve.
 */
export type ConformetryNxConfiguration = ConformetryNxGeneratorDefinition[];

/** One generator, whose instance groups this plugin resolves against Nx. */
export interface ConformetryNxGeneratorDefinition extends Omit<
  ConformetryGeneratorDefinition,
  "instances"
> {
  instances?: ConformetryNxInstanceGroup[] | undefined;
}

/**
 * One instance group, a workspace glob or a project selector, told apart by
 * `tags`. No second field can disagree with the globs.
 */
export type ConformetryNxInstanceGroup =
  | ConformetryNxProjectInstanceGroup
  | ConformetryNxWorkspaceInstanceGroup;

/** Instances located by project tag, with globs read inside each project. */
export interface ConformetryNxProjectInstanceGroup extends ConformetryInstanceGroup {
  /**
   * Globs relative to each matching project's root, or `.` for the project
   * itself. Omitted, the projects are selected without locating anything in them.
   */
  patterns?: string[] | undefined;
  /** Nx project tags a project must carry. A project must carry all of them. */
  tags: string[];
}

/** Instances located by workspace-relative globs, as any host resolves them. */
export interface ConformetryNxWorkspaceInstanceGroup extends ConformetryInstanceGroup {
  patterns: string[];
  /** Absent: this is the form a host with no project graph also uses. */
  tags?: undefined;
}
