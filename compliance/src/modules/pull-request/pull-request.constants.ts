// ♟️ Constants

export const MERGE_GROUP_EVENT = "merge_group";
export const PULL_REQUEST_EVENT = "pull_request";

export const DEPENDABOT_LOGIN = "dependabot[bot]";

/** How to run the command, printed when its input is unusable. */
export const USAGE_LINES = [
  "Usage: compliance pull-request <number> [write]",
  "   or: GITHUB_EVENT_NAME=pull_request PULL_REQUEST_NUMBER=… compliance pull-request",
  "   or: GITHUB_EVENT_NAME=merge_group HEAD_REF=… compliance pull-request",
];
