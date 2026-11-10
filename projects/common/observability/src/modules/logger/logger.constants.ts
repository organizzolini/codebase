// ♟️ Constants

/**
 * A leading emoji, optionally a ZWJ sequence, then whitespace.
 * `Extended_Pictographic` keeps new emoji matching; the variation selector is
 * optional.
 */
export const LEADING_EMOJI_PATTERN =
  /^(\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*)\s+/u;

/**
 * The file descriptor standard error is opened on. Diagnostics belong here: a
 * log line on standard output corrupts the result.
 */
export const STANDARD_ERROR_DESCRIPTOR = 2;

/** The file descriptor standard output is opened on, and the default. */
export const STANDARD_OUTPUT_DESCRIPTOR = 1;

/** The first run of letters in a message, once its emoji has been removed. */
export const FIRST_WORD_PATTERN = /^([A-Za-z]+)/;

/**
 * Past tenses that `-ing`/`-ed` morphology cannot derive. Keep it to irregulars
 * only, so it never grows with the codebase's vocabulary.
 */
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

/**
 * Log contexts the convention skips: a validation throw on a framework's error
 * path would abort the process.
 */
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
