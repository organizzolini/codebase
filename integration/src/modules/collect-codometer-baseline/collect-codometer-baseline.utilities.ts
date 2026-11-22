// 🛠️ Utilities

import { BASELINE_ARTIFACT } from "./collect-codometer-baseline.constants";

/**
 * The `gh` arguments naming the run of the newest unexpired baseline artifact on `main`.
 */
export function buildFindBaselineArguments(repository: string): string[] {
  return [
    "api",
    `repos/${repository}/actions/artifacts?name=${BASELINE_ARTIFACT}&per_page=30`,
    '--jq=[.artifacts[] | select(.expired == false and .workflow_run.head_branch == "main")][0].workflow_run.id',
  ];
}
