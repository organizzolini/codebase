// ♟️ Constants

/** Marks the first frame of a printed call stack. */
export const ENTRY_FRAME_PREFIX = "🚀";

/** Marks every frame below the first. */
export const NESTED_FRAME_PREFIX = "└─>";

/** Signature characters a frame prints before parameters collapse. */
export const SIGNATURE_LIMIT = 80;

/** Stands in for a parameter list too long to print. */
export const COLLAPSED_PARAMETERS = "(…)";

/** Documentation characters a printed frame keeps. JSON keeps all of it. */
export const SUMMARY_LIMIT = 120;

/** Sentence break: a capital must follow, so `e.g.` does not split. */
export const SENTENCE_END_PATTERN = /[!.?](?=\s+[A-Z])/;

/** Appended to a summary cut mid-thought. */
export const TRUNCATION_SUFFIX = "…";

/** Marks a frame whose callable is on its way out. */
export const DEPRECATED_MARKER = "⚠ deprecated";

/** Introduces the documentation line printed under a frame. */
export const SUMMARY_PREFIX = "↳";

/** Opens every diagram left to right, the way a stack reads. */
export const MERMAID_FLOWCHART_HEADER = "flowchart LR";

/** Callables a diagram draws, since GitHub caps mermaid at 50,000 characters. */
export const MAXIMUM_DIAGRAM_NODES = 300;

/** Prefix of every generated node identifier. */
export const DIAGRAM_NODE_PREFIX = "n";

/** What mermaid would read as syntax inside a node label. */
export const MERMAID_LABEL_ESCAPES: ReadonlyMap<string, string> = new Map([
  ["<", "#lt;"],
  [">", "#gt;"],
  ['"', "#quot;"],
]);

/** Header of the run or project summary table. */
export const MARKDOWN_SUMMARY_HEADER = "| Measure | Value |\n| --- | --- |";

/** Header of the breadth table. */
export const MARKDOWN_WIDE_CALLABLES_HEADER =
  "| Callable | Breadth | Calls directly | Location |\n| --- | --- | --- | --- |";

/** Heading for stacks deeper than allowed, identical in both renderings. */
export const MARKDOWN_DEEP_STACKS_HEADING = "Call stacks over the depth limit";

/** Heading over the callables that called more directly than allowed. */
export const MARKDOWN_WIDE_CALLABLES_HEADING =
  "Callables over the breadth limit";

/** Names the workspace root when it is a traced project. */
export const ROOT_PROJECT_LABEL = ".";

/** Header of the per-project index table. */
export const MARKDOWN_PROJECT_INDEX_HEADER =
  "| Project | Deepest | Limit | Headroom | Widest |\n| --- | --- | --- | --- | --- |";

/** Header of the depth-headroom scoreboard. */
export const MARKDOWN_HEADROOM_HEADER =
  "| Headroom | Projects |\n| --- | --- |";

/** Heading over the limits one project's own section is judged against. */
export const MARKDOWN_PROJECT_LIMITS_HEADING = "Limits";

/** Header of a project's limits table. Two columns, no absolute paths. */
export const MARKDOWN_PROJECT_LIMITS_HEADER =
  "| Limit | Value |\n| --- | --- |";

/** Says where the numbers come from, in the `limits` command's words. */
export const MARKDOWN_PROJECT_LIMITS_SUMMARY =
  "What this project is judged against, as declared in its own `callidescope.config.ts`.";

/** The two gated limits, in print order: depth, then optional breadth. */
export const MARKDOWN_PROJECT_LIMIT_NAMES = [
  "maximumDepth",
  "maximumBreadth",
] as const;

/** Shown when nothing declares the limit, since breadth has no default. */
export const NO_LIMIT_LABEL = "none";

/** Bucket holding the projects whose deepest stack broke their own limit. */
export const HEADROOM_BUCKET_OVER_LIMIT = "over limit";

/** Bucket holding the projects sitting exactly on their own limit. */
export const HEADROOM_BUCKET_AT_LIMIT = "0 — at limit";

/** Bucket holding the projects one frame from their own limit. */
export const HEADROOM_BUCKET_ONE = "1";

/** Bucket holding the projects two or three frames from their own limit. */
export const HEADROOM_BUCKET_TWO_TO_THREE = "2–3";

/** Bucket holding the projects with room to spare. */
export const HEADROOM_BUCKET_FOUR_PLUS = "4+";

/** Bucket for projects with no stack. Such a limit gates nothing. */
export const HEADROOM_BUCKET_UNMEASURED = "no stacks";

/** Scoreboard bucket order, tightest first. Fixed, so empty ones still print. */
export const HEADROOM_BUCKET_ORDER = [
  HEADROOM_BUCKET_OVER_LIMIT,
  HEADROOM_BUCKET_AT_LIMIT,
  HEADROOM_BUCKET_ONE,
  HEADROOM_BUCKET_TWO_TO_THREE,
  HEADROOM_BUCKET_FOUR_PLUS,
  HEADROOM_BUCKET_UNMEASURED,
] as const;
