// 🏷️ Types

import type {
  CodometerCommentLanguage,
  CodometerCommentMeasurement,
} from "@codometer/configuration";
import type { CodometerSeverity, CodometerSymbolKind } from "@codometer/core";
import type { CommentRange } from "typescript";
import type { LineCounter } from "yaml";

/** A run of comment lines a reader takes as one thought. */
export interface CommentBlock {
  tokens: CommentToken[];
}

/** How long one comment block may run, per the `comment` selector. */
export interface CommentBudget {
  maximumCharacters: number | undefined;
  maximumLines: number | undefined;
  maximumWords: number | undefined;
  severity: CodometerSeverity;
}

/** One `comment` statistic's budget and overage; `kind` wins over `language`. */
export interface CommentCounter {
  budget: CommentBudget;
  kind: CodometerSymbolKind | undefined;
  label: string;
  language: CodometerCommentLanguage | undefined;
}

/** One comment block, measured against one declared maximum. */
export type CommentMeasurement = CodometerCommentMeasurement;

/** One comment line, with where it sits and what it says. */
export interface CommentToken {
  /** 1-indexed line the comment is written on. */
  line: number;
  /** Whether nothing but whitespace precedes it on its line. */
  ownLine: boolean;
  /** The comment's prose, with its marker already stripped. */
  prose: string;
  /** The comment exactly as the file carries it, marker and all. */
  source: string;
}

/** One measurement, tagged with the custom statistic label that produced it. */
export interface LabeledCommentMeasurement {
  label: string;
  measurement: CommentMeasurement;
}

/** Comment-bearing files per language, declared here so `languages` needs only `comments`. */
export interface LanguageCommentFiles {
  cssFiles: string[];
  hclFiles: string[];
  shellFiles: string[];
  /** TypeScript and JavaScript sources, in every dialect the workspace holds. */
  sourceFiles: string[];
  sqlFiles: string[];
  tomlFiles: string[];
  yamlFiles: string[];
}

/** A comment token together with the file it was found in. */
export interface LocatedCommentToken extends CommentToken {
  file: string;
}

/** Arguments accepted when measuring one file's comment blocks. */
export interface MeasureCommentsArguments {
  comments: CommentBudget;
  filePath: string;
  tokens: CommentToken[];
}

/** Arguments accepted when measuring one comment's text directly. */
export interface MeasureCommentTextArguments {
  comments: CommentBudget;
  declaration: string;
  filePath: string;
  kind: string;
  line: number;
  /** The comment's prose, with every marker stripped. */
  prose: string;
  /** The comment exactly as the file carries it, markers and all. */
  source: string;
}

/** Arguments accepted when measuring every configured language's comments. */
export interface MeasureLanguageCommentsArguments {
  /** One `comment`-selector custom statistic's budget, per declared statistic. */
  counters: CommentCounter[];
  files: LanguageCommentFiles;
  /**
   * Python's comments, already found by its own analyzer.
   *
   * Read by `tokenize`, which tells a real comment from a `#` inside a string.
   */
  pythonComments: readonly LocatedCommentToken[];
  workingDirectory: string;
}

/** A comment token with the YAML tree offset that orders it. */
export interface PositionedToken {
  offset: number;
  token: CommentToken;
}

/** One TypeScript or JavaScript file's in-progress scan, keyed by position. */
export interface TypescriptCommentScan {
  content: string;
  ranges: Map<number, CommentRange>;
}

/** One YAML file's in-progress scan: text, lines, and findings. */
export interface YamlCommentScan {
  content: string;
  lineCounter: LineCounter;
  tokens: PositionedToken[];
}
