// 🏷️ Types

/** A worked example rendered under `output/`, checked against the commit. */
export interface ExampleDocument {
  /** File stem the document is written under, such as `03-ambient-modules`. */
  readonly id: string;
  /** JSON exports committed beside the document, if it has any. */
  readonly jsonExports: ExampleJsonExport[];
  /** The example's sections, in reading order. */
  readonly sections: ExampleSection[];
  /** One or two sentences saying what the example demonstrates. */
  readonly summary: string;
  /** Title rendered as the document's top-level heading. */
  readonly title: string;
}

/** One file a document is committed as, relative to the output directory. */
export interface ExampleFile {
  readonly content: string;
  readonly relativePath: string;
}

/** A committed JSON export, so readers see its shape. */
export interface ExampleJsonExport {
  /**
   * Content, already rendered by `DeliveryService.renderJson` so it is
   * byte-identical to what a real `codependix map --write` would produce.
   */
  readonly content: string;
  /**
   * File name, committed in the example's own directory. Named
   * `codependix-*graph.json` to inherit the codependix lint carve-outs.
   */
  readonly fileName: string;
}

/** Which of the two run modes a command line resolved to. */
export type ExampleRunMode = "check" | "write";

/** Every example's outcome from one run. */
export interface ExampleRunOutcome {
  /** Files whose committed content no longer matches what was rendered. */
  readonly stalePaths: string[];
  /** How many files the run compared or wrote. */
  readonly writtenCount: number;
}

/** One titled part of an example document. */
export interface ExampleSection {
  /** Already-rendered Markdown — a fenced diagram, a fenced block, or prose. */
  readonly body: string;
  /** Heading text, unique among its siblings in one document. */
  readonly heading: string;
  /** A sentence placed above the body explaining what to look at. */
  readonly note: string;
}
