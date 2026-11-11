// 🏷️ Types

import type {
  CommentCounter,
  CommentMeasurement,
} from "../comments/comments.types";
import type {
  CodometerSymbolKind,
  CodometerSymbolModifier,
} from "@codometer/core";
import type { SourceFile } from "typescript";

/** Arguments for analyzing a single source file. */
export interface AnalyzeTypescriptFileArguments {
  commentCounters: CommentCounter[];
  counters: TypescriptSymbolCounter[];
  filePath: string;
  stats: TypescriptResult;
  workingDirectory: string;
}

/** Everything one walk of one file's AST needs to carry down the tree. */
/** One node's JSDoc measurement inputs, gathered to keep frames shallow. */
export interface PreparedDeclarationComment {
  counters: CommentCounter[];
  declaration: string;
  kind: CodometerSymbolKind;
  line: number;
  prose: string;
  source: string;
}

/** Input to the TypeScript/JavaScript AST analysis step. */
export interface TypescriptInput {
  /**
   * One `comment` budget per declared statistic, for every statistic in the configuration.
   *
   * Only `kind` counters are read here; the rest are ignored.
   */
  commentCounters: CommentCounter[];
  sourceFiles: string[];
  /** Configured counters over declarations, tallied during the same walk. */
  symbolCounters: TypescriptSymbolCounter[];
  workingDirectory: string;
}

/** Aggregated metrics collected from walking TypeScript and JavaScript ASTs. */
export interface TypescriptResult {
  asyncFunctions: number;
  blockComments: number;
  classes: number;
  commentLines: number;
  comments: number;
  constants: number;
  /** One measurement list per configured declaration-comment counter, keyed by its label. */
  declarationCommentCounts: Record<string, CommentMeasurement[]>;
  decorators: number;
  docComments: number;
  docTags: Record<string, number>;
  enums: number;
  exported: number;
  externalPackages: Set<string>;
  functions: number;
  genericDeclarations: number;
  imports: number;
  interfaces: number;
  jsFiles: number;
  lineComments: number;
  lines: number;
  methods: number;
  /** One tally per configured symbol counter, keyed by its label. */
  symbolCounts: Record<string, number>;
  syncFunctions: number;
  testFiles: number;
  todos: number;
  tsFiles: number;
}

/** One configured counter over declarations, resolved for the analyzer. */
export interface TypescriptSymbolCounter {
  kinds: CodometerSymbolKind[];
  label: string;
  modifiers: CodometerSymbolModifier[];
  /** Globs narrowing which files are searched; empty searches all of them. */
  patterns: string[];
}

/** Per-file state carried through the AST walk, narrowed once per file. */
export interface TypescriptWalkContext {
  commentCounters: CommentCounter[];
  /**
   * Symbol counters that apply to the file being walked.
   *
   * Narrowed once per file, since a path does not change during the walk.
   */
  counters: TypescriptSymbolCounter[];
  filePath: string;
  insideClass: boolean;
  sourceFile: SourceFile;
  stats: TypescriptResult;
}
