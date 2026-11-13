// ♟️ Constants

import { z } from "zod";

import type {
  CoinagerieConfiguration,
  ExcludedWords,
  FoldWord,
} from "./configuration.types";

/** Config file names searched in the working directory, in order. */
export const CONFIGURATION_FILE_NAMES = [
  "coinagerie.config.ts",
  "coinagerie.config.mts",
  "coinagerie.config.cts",
  "coinagerie.config.js",
  "coinagerie.config.mjs",
  "coinagerie.config.cjs",
] as const;

/** Globs for all files, dot-files too, since `*` skips dots. */
export const DEFAULT_INCLUDE = ["**", "**/.*", "**/.*/**"] as const;

/** Markdown description lines barred: list items and HTML comments. */
const DESCRIPTION_FORBIDDEN_LINE_PATTERN = /^\s*(?:[-*+]\s|<!--)/mu;

const jsonOutputSchema = z.strictObject({
  path: z.string().min(1),
  type: z.literal("json"),
});

const descriptionSchema = z
  .string()
  .refine(
    (description) => !DESCRIPTION_FORBIDDEN_LINE_PATTERN.test(description),
    {
      message:
        "A description may not hold a list item or an HTML comment, which would read back as part of the glossary",
    },
  );

/** A function, whose types are known only when called. */
const isFunction = (value: unknown): value is (...args: never[]) => unknown =>
  typeof value === "function";

/** One entry of `exclude.words`: an exact word, or a pattern. */
const excludedWordSchema = z.union([z.string(), z.instanceof(RegExp)]);

/** What `exclude.words` must come to once any function has been called. */
export const WORD_LIST_SCHEMA = z.array(excludedWordSchema);

/** A `fold` result: text with no whitespace or `*`. */
export const FOLDED_WORD_SCHEMA = z.string().regex(/^[^\s*]+$/u);

/** An `unfolded` entry: a lowercase word, as every collected word is. */
const UNFOLDED_WORD_SCHEMA = z
  .string()
  .regex(/^[^\s*]+$/u)
  .refine((word) => word === word.toLowerCase(), {
    message: "Expected a lowercase word",
  });

const markdownOutputSchema = z.strictObject({
  description: descriptionSchema.optional(),
  path: z.string().min(1),
  type: z.literal("markdown"),
});

/** The shape the command line's overrides must have. */
export const OVERRIDES_SCHEMA = z.strictObject({
  description: descriptionSchema.optional(),
  excludePaths: z.array(z.string()).optional(),
  include: z.array(z.string()).optional(),
  outputJson: z.string().min(1).optional(),
  outputMarkdown: z.string().min(1).optional(),
});

/** Strict configuration schema, so a misspelled field fails the run. */
export const CONFIGURATION_SCHEMA: z.ZodType<CoinagerieConfiguration> =
  z.strictObject({
    exclude: z
      .strictObject({
        paths: z.array(z.string()).optional(),
        words: z
          .union([
            z.array(excludedWordSchema),
            z.custom<Extract<ExcludedWords, () => unknown>>(isFunction, {
              message:
                "Expected a list of words or regular expressions, or a function returning one",
            }),
          ])
          .optional(),
      })
      .optional(),
    fold: z
      .custom<FoldWord>(isFunction, { message: "Expected a function" })
      .optional(),
    include: z.array(z.string()).optional(),
    outputs: z
      .array(
        z.discriminatedUnion("type", [jsonOutputSchema, markdownOutputSchema]),
      )
      .optional(),
    unfolded: z.array(UNFOLDED_WORD_SCHEMA).optional(),
  });
