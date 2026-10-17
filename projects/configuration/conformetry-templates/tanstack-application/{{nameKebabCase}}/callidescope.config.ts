import { projectDefaults } from "@codebase/configuration/callidescope.config";

/**
 * TODO: Measure this application's stacks, and set limits here at what they
 * measure where the workspace defaults do not fit.
 */
export default {
  ...projectDefaults,
  /**
   * The generated route tree describes a code generator's output rather than
   * anything a person structured, so a depth finding there is not actionable.
   */
  exclude: ["src/lib/routeTree.gen.ts"],
};
