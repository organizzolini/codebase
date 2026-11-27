// ♟️ Constants

import { z } from "zod";

/** The workspace root, which every path here is relative to. */
export const WORKSPACE_ROOT = ".";

/** Where the central charts live, relative to the workspace root. */
export const HELM_ROOT = "infrastructure/helm";

/** Where chart folders sit: central, or in a project's `infrastructure` folder. */
export const CHART_PATTERNS = [
  `${HELM_ROOT}/*/Chart.yaml`,
  "projects/**/infrastructure/helm/*/Chart.yaml",
];

/** Folders chart discovery never enters. */
export const IGNORED_FOLDERS = ["**/node_modules"];

/** The values file every release layers first. */
export const BASE_VALUES = "base.yaml";

/** The chart whose values list the Argo CD Applications. */
export const APPLICATIONS_CHART = "argocd";

/** The namespace of a release no Application or override names. */
export const DEFAULT_NAMESPACE = "default";

/** Fills an empty `image.tag`, so charts that render nothing without one render. */
export const PLACEHOLDER_IMAGE_TAG = "0.0.0";

/** The optional per-chart file for what the chart's files cannot say. */
export const OVERRIDE_FILE = "release.yaml";

/** What a chart's `release.yaml` may set. */
export const overrideSchema = z.strictObject({
  namespace: z.string().min(1).optional(),
  strings: z.record(z.string(), z.string()).optional(),
});

/** The parts of an Argo CD Application discovery reads. */
export const applicationsSchema = z.object({
  applications: z.array(
    z.object({
      namespace: z.string(),
      path: z.string().optional(),
      valueFiles: z.array(z.string()).optional(),
    }),
  ),
});

/** What a values file says of the image tag. */
export const valuesSchema = z.looseObject({
  image: z.looseObject({ tag: z.string().optional() }).optional(),
});
