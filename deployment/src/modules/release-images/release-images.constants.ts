import { z } from "zod";

import type { ImageTarget } from "./release-images.types";

// ♟️ Constants

/** What a release version looks like. */
export const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[\w.\-]+)?$/v;

/** What `nx show projects --json` prints: the project names. */
export const projectNamesSchema = z.array(z.string());

/** The images a release builds, and where their tags go. */
export const IMAGE_TARGETS: readonly ImageTarget[] = [
  {
    fields: [
      {
        file: "infrastructure/helm/kubernetes-deployment/values/caelundas-api.yaml",
        path: ["image", "tag"],
      },
    ],
    project: "caelundas-api",
  },
  {
    fields: [
      {
        file: "infrastructure/helm/kubernetes-deployment/values/caelundas-web.yaml",
        path: ["image", "tag"],
      },
    ],
    project: "caelundas-web",
  },
  {
    fields: [
      {
        file: "infrastructure/helm/kubernetes-job/values/caelundas-cli.yaml",
        path: ["image", "tag"],
      },
    ],
    project: "caelundas-cli",
  },
];

/** Reports a version that cannot be a release's. */
export const invalidVersionMessage = (version: string): string =>
  `❌ "${version}" is not a release version`;

/** Reports an image being built, or one left alone. */
export const imageMessage = (project: string, affected: boolean): string =>
  affected
    ? `📦 ${project} changed since the last release; building it`
    : `⏭️ ${project} did not change since the last release; keeping its tag`;
