import {
  describeBuilt,
  renderBoundaryRun,
  runBoundaryCheck,
} from "./boundary-run";
import { fenceJson } from "./document";
import { EXAMPLE_ROOT_MODULES } from "./nestjs-graphs";
import { renderWorkspaceGraph } from "./nx-graphs";
import { EXAMPLES_DIRECTORY } from "./paths";

import type { BoundaryRun } from "./boundary-run";
import type { ExampleWorkspace } from "./nx-graphs";
import type { ExampleDocument } from "./types";
import type { CodependixBoundaryRule } from "@codependix/configuration";

// ♟️ Constants

/** An app importing a throwing module, rooted on disk. */
const STOREFRONT: ExampleWorkspace = {
  dependencies: [
    { source: "storefront-api", target: "storefront-catalog", type: "static" },
  ],
  projects: [
    {
      name: "storefront-api",
      root: "boundary-boot-failures/storefront-api",
      tags: ["framework:nestjs"],
    },
    {
      name: "storefront-catalog",
      root: "boundary-boot-failures/storefront-catalog",
      tags: ["framework:nestjs"],
    },
  ],
};

/** The one NestJS-level rule; boot failures are reported regardless. */
const NO_MODULE_CYCLES: CodependixBoundaryRule[] = [
  { kind: "acyclic", name: "no-module-cycles" },
];

// 🏃 Running

/** Builds the example showing a container boot failure and who owns it. */
export async function buildBootFailureDocuments(): Promise<ExampleDocument[]> {
  const api = await runBootCheck({ judged: ["storefront-api"] });
  const catalog = await runBootCheck({ judged: ["storefront-catalog"] });

  return [
    {
      id: "boundary-boot-failures",
      jsonExports: [],
      sections: [
        {
          body: renderWorkspaceGraph(STOREFRONT),
          heading: "An application importing a module from another project",
          note: "Both projects are tagged `framework:nestjs`, so both have a container to boot. `storefront-catalog`'s module file throws as it is evaluated — deliberately, the way [`container-rooting`](../container-rooting/README.md)'s `failing-container` does, standing in for the circular value import that fails a real container with `Cannot access 'X' before initialization` — and `storefront-api`'s `MainModule` imports it.",
        },
        {
          body: renderBoundaryRun(api),
          heading: "The container that failed is the project that fails",
          note: "`storefront-api` really cannot boot, so it fails, and its line names `storefront-catalog` as the project that owns the code it died on. The owner is read off the error's stack: the first frame inside the root of a project the charged one depends on. When no frame resolves to one, no owner is named rather than a guessed one. `storefront-catalog`'s own container fails the same way, but it is a dependency and not judged, so it is a `note`.",
        },
        {
          body: renderBoundaryRun(catalog),
          heading: "Judging the failing project itself names no owner",
          note: [
            "With `storefront-catalog` judged, the failing code is its own, so the failure carries no `ownerProject`. It depends on nothing here.",
            describeBuilt(catalog),
          ].join(" "),
        },
        {
          body: fenceJson(api.report),
          heading: "The same findings as `--format json` prints them",
          note: "`ownerProject` appears only on a failure whose code belongs to another project. A failure in the charged project's own code leaves the key out. See [The boundary report](../../../codependix-cli/README.md#the-boundary-report).",
        },
      ],
      summary:
        "A container boot failure fails the project whose container failed, and names the project that owns the class it failed on when that is a different one.",
      title: "A container that cannot boot names who owns the failure",
    },
  ];
}

/** Runs the storefront workspace's NestJS level. */
export async function runBootCheck(args: {
  judged: readonly string[];
}): Promise<BoundaryRun> {
  return runBoundaryCheck({
    judged: args.judged,
    rootModules: EXAMPLE_ROOT_MODULES,
    rules: { nestjsModules: NO_MODULE_CYCLES },
    workingDirectory: EXAMPLES_DIRECTORY,
    workspace: STOREFRONT,
  });
}
