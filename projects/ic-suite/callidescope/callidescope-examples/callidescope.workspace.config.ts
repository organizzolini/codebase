import type { CallidescopeConfiguration } from "@callidescope/configuration";

/** Fixture trace settings: tool defaults, so fixtures produce findings. Not named `callidescope.config.ts`, or discovery reads it as a project file. */
const callidescopeConfiguration: CallidescopeConfiguration = {
  /**
   * The workspace configuration project is not a project configuration.
   *
   * Its `callidescope.config.ts` is this run's own file and sets workspace-only
   * fields (`excludeCallees`, `excludeFrom`, `write.json`) that a project file
   * must not set. When the closure reaches `configuration`, excluding
   * it here keeps the run scoped to fixture code and toolchain dependencies.
   */
  exclude: ["configuration/**"],
  limits: {
    /**
     * The tool's own default, so the deliberately deep fixtures are findings.
     *
     * Seven frames and up are reported; `DeepStackService` and
     * `ForwardingStackService` are eight apiece, and both are meant to fail.
     */
    maximumDepth: 6,
  },
  write: {
    /** The whole run as JSON, which is the machine-readable shape. */
    json: {
      path: "projects/ic-suite/callidescope/callidescope-examples/output/report.json",
    },
    /** The printed trees, spliced between anchors. */
    markdown: {
      path: "projects/ic-suite/callidescope/callidescope-examples/output/report.md",
    },
    /** The same stacks drawn as one flowchart instead of printed. */
    mermaid: {
      path: "projects/ic-suite/callidescope/callidescope-examples/output/diagram.md",
    },
  },
};

export default callidescopeConfiguration;
