// ♟️ Constants

/** Leading emoji, optionally a ZWJ sequence, then whitespace. */
export const LEADING_EMOJI_PATTERN =
  /^(\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*)\s+/u;

/** File descriptor for diagnostics; stdout log lines corrupt results. */
export const STANDARD_ERROR_DESCRIPTOR = 2;

/** The file descriptor standard output is opened on, and the default. */
export const STANDARD_OUTPUT_DESCRIPTOR = 1;

/** First run of letters after the emoji is removed. */
export const FIRST_WORD_PATTERN = /^([A-Za-z]+)/;

/** Irregular past tenses that suffix rules cannot derive. */
export const IRREGULAR_PAST_VERBS = new Set([
  "built",
  "cut",
  "found",
  "got",
  "kept",
  "left",
  "lost",
  "made",
  "put",
  "ran",
  "read",
  "rebuilt",
  "sent",
  "set",
  "split",
  "took",
  "wrote",
]);

/** Log contexts the convention skips; throws there abort the process. */
export const UNVALIDATED_LOG_CONTEXTS = new Set([
  "CommandFactory",
  "ExceptionHandler",
  "ExceptionsHandler",
  "GraphQLModule",
  "InstanceLoader",
  "NestApplication",
  "NestFactory",
  "RouterExplorer",
  "RoutesResolver",
  "TypeOrmModule",
]);
