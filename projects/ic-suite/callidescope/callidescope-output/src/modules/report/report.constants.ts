// ♟️ Constants

/** Marks the first frame of a printed call stack. */
export const ENTRY_FRAME_PREFIX = "🚀";

/** Marks every frame below the first. */
export const NESTED_FRAME_PREFIX = "└─>";

/** Characters of signature a frame prints before collapsing the parameters. Long injected constructors would otherwise break the stack's shape. */
export const SIGNATURE_LIMIT = 80;

/** Stands in for a parameter list too long to print. */
export const COLLAPSED_PARAMETERS = "(…)";

/** Characters of documentation prose a printed frame keeps. The tree orients a reader; the JSON report keeps the whole comment. */
export const SUMMARY_LIMIT = 120;

/** Ends a sentence when the next one starts. The capital after the space tells a break from `e.g.` or a dotted identifier. */
export const SENTENCE_END_PATTERN = /[!.?](?=\s+[A-Z])/;

/** Appended to a summary cut mid-thought. */
export const TRUNCATION_SUFFIX = "…";

/** Marks a frame whose callable is on its way out. */
export const DEPRECATED_MARKER = "⚠ deprecated";

/** Introduces the documentation line printed under a frame. */
export const SUMMARY_PREFIX = "↳";

/** Opens every diagram, left to right: the direction a stack reads and a wide, shallow graph fits a page. */
export const MERMAID_FLOWCHART_HEADER = "flowchart LR";

/** Callables a diagram draws before it stops accepting stacks. GitHub refuses mermaid blocks past 50,000 characters; whole stacks drop, never trimmed. */
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

/** Heading over stacks deeper than their project allows. A constant, so a reader grepping a failed run finds the same text in both renderings. */
export const MARKDOWN_DEEP_STACKS_HEADING = "Call stacks over the depth limit";

/** Heading over the callables that called more directly than allowed. */
export const MARKDOWN_WIDE_CALLABLES_HEADING =
  "Callables over the breadth limit";

/** Stands in for the workspace root when it is itself a traced project. */
export const ROOT_PROJECT_LABEL = ".";

/** Header of the per-project index table. */
export const MARKDOWN_PROJECT_INDEX_HEADER =
  "| Project | Deepest | Limit | Headroom | Widest |\n| --- | --- | --- | --- | --- |";

/** Header of the depth-headroom scoreboard. */
export const MARKDOWN_HEADROOM_HEADER =
  "| Headroom | Projects |\n| --- | --- |";

/** Heading over the limits one project's own section is judged against. */
export const MARKDOWN_PROJECT_LIMITS_HEADING = "Limits";

/** Header of a project's own limits table. Two columns, since no absolute path belongs in a committed file. */
export const MARKDOWN_PROJECT_LIMITS_HEADER =
  "| Limit | Value |\n| --- | --- |";

/** Says where the numbers come from, worded as the `limits` command words it so a reader learns the vocabulary once. */
export const MARKDOWN_PROJECT_LIMITS_SUMMARY =
  "What this project is judged against, as declared in its own `callidescope.config.ts`.";

/** The two gated limits, in print order. Depth comes first because every project has an answer for it; breadth is optional. */
export const MARKDOWN_PROJECT_LIMIT_NAMES = [
  "maximumDepth",
  "maximumBreadth",
] as const;

/** Shown when nothing declares the limit. Printing a number would say the opposite: breadth has no default. */
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

/** Bucket for projects measuring no stack. Not the widest headroom bucket: such a limit gates nothing, the opposite finding. */
export const HEADROOM_BUCKET_UNMEASURED = "no stacks";

/** The order the scoreboard prints buckets, tightest first. Fixed, so an empty bucket still prints as zero. */
export const HEADROOM_BUCKET_ORDER = [
  HEADROOM_BUCKET_OVER_LIMIT,
  HEADROOM_BUCKET_AT_LIMIT,
  HEADROOM_BUCKET_ONE,
  HEADROOM_BUCKET_TWO_TO_THREE,
  HEADROOM_BUCKET_FOUR_PLUS,
  HEADROOM_BUCKET_UNMEASURED,
] as const;
