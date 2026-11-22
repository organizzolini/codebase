// 🛠️ Utilities

import { BASELINE_ARTIFACT } from "./collect-codometer-baseline.constants";

/**
 * The `gh` arguments that name the run holding the newest unexpired baseline artifact on `main`, found by the artifact itself, so a run that uploaded none cannot hide it.
 */
export function buildFindBaselineArguments(repository: string): string[] {
  return [
    "api",
    `repos/${repository}/actions/artifacts?name=${BASELINE_ARTIFACT}&per_page=30`,
    '--jq=[.artifacts[] | select(.expired == false and .workflow_run.head_branch == "main")][0].workflow_run.id',
  ];
}
