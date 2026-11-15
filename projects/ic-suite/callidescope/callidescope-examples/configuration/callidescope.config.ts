import type { CallidescopeProjectConfiguration } from "@callidescope/configuration";

/**
 * Complete configuration. Five is one tighter than the workspace's six.
 */
const callidescopeConfiguration: CallidescopeProjectConfiguration = {
  entryPoints: {
    /**
     * One address, for a callable no rule would have rooted.
     *
     * `DeclaredEntryPointsService.collect` is called from inside this package,
     * so orphan promotion never sees it and it would head no stack of its own.
     * Naming it here roots it under the `declared` kind, which is how a package
     * states the surface it means to be measured on.
     */
    addresses: [
      "projects/ic-suite/callidescope/callidescope-examples/examples/declared-entry-points/declared-entry-points.ts#DeclaredEntryPointsService.collect",
    ],
    /**
     * The tool's own list, written out rather than imported.
     *
     * A value import here would be a real call-graph edge from this fixture
     * into `@callidescope/configuration`, widening the closure this run
     * measures. A real package spreads `projectDefaults` and never has to
     * think about it.
     */
    decorators: [
      "Command",
      "Cron",
      "Delete",
      "Get",
      "Mutation",
      "OnEvent",
      "Option",
      "Patch",
      "Post",
      "Put",
      "Query",
      "ResolveField",
      "SubscribeMessage",
    ],
    includeExportedFunctions: true,
    includeOrphans: true,
    includeTests: false,
  },
  exclude: [],
  limits: {
    /** No breadth limit here: the leaf next door is where breadth is gated. */
    maximumBreadth: undefined,
    /** Five, one under the six the run supplies. */
    maximumDepth: 5,
  },
  write: {
    /** The `## 🔭 Callidescope` section at the bottom of this package's README. */
    markdown: {
      heading: "## 🔭 Callidescope",
      path: "README.md",
    },
    /** The run's own diagram is published by the workspace configuration. */
    mermaid: undefined,
  },
};

export default callidescopeConfiguration;
