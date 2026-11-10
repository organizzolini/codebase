// ♟️ Constants

import { z } from "zod";

import type { ConventionalLabel } from "./pull-request-labels.types";

/** The vocabulary's single source of truth, relative to the workspace root. */
export const CONVENTIONAL_CONFIG_PATH = "configuration/conventional.config.cjs";

/** Color every `type:` label carries, so the family reads as one at a glance. */
export const TYPE_LABEL_COLOR = "d93f0b";

/** Color every `scope:` label carries. */
export const SCOPE_LABEL_COLOR = "1d76db";

/** Labels no configuration derives, so they are written here and reconciled with the derived ones. */
export const STATIC_LABELS: ConventionalLabel[] = [
  {
    color: "b60205",
    description: "Do not merge this pull request yet",
    name: "do-not-merge",
  },
  {
    color: "e99695",
    description: "Opened by a coding agent",
    name: "source:agent",
  },
  {
    color: "e99695",
    description: "Opened by a human",
    name: "source:human",
  },
];

/** Prefixes this reconciliation owns. Labels outside them belong to someone else and are neither expected nor reported. */
export const TRACKED_LABEL_PREFIXES = ["scope:", "source:", "type:"];

/** Page size for `gh label list`, well above the roughly forty labels here, so one call returns them all and none looks missing. */
export const LABEL_LIST_LIMIT = "500";

/** The shape `gh label list --json name,color,description` returns. */
export const repositoryLabelsSchema = z.array(
  z.object({
    color: z.string(),
    description: z.string(),
    name: z.string(),
  }),
);

/** The shape `conventional.config.cjs` exports, as much of it as is read here. */
export const conventionalConfigSchema = z.object({
  scopes: z.array(z.object({ description: z.string(), name: z.string() })),
  types: z.array(z.object({ description: z.string(), name: z.string() })),
});
