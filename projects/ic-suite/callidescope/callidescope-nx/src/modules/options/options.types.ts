// 🏷️ Types

/** Options accepted from this plugin's `nx.json` registration. */
export interface CallidescopePluginOptions {
  /** Name of the inferred per-project breadth-lookup target. */
  readonly breadthTargetName: string;
  /** Where the callidescope configuration lives, workspace-root relative. */
  readonly configurationPath: string;
  /** Name of the inferred per-project depth-lookup target. */
  readonly depthTargetName: string;
  /** Name of the inferred per-project gate target. */
  readonly gateTargetName: string;
  /** Where each project keeps its own configuration, project-root relative. No default, and never searched for. */
  readonly projectConfigurationPath: string;
  /** Where each project keeps its TypeScript configuration, project-root relative. No default, and never searched for. */
  readonly projectTsconfigPath: string;
  /** Name of the inferred per-project trace target. */
  readonly traceTargetName: string;
}
