/** What `findGuideGaps` reads. */
export interface GuideGapOptions {
  /** The folder holding one folder per example. */
  readonly examplesDirectory: string;
  /** The package guide's text, which indexes every example. */
  readonly packageGuide: string;
}

/** Where `stageExample` copies an example, and what it adds. */
export interface StageExampleOptions {
  /** Files written after the copy, keyed by relative path. */
  readonly files?: Readonly<Record<string, string>>;
  /** Creates an empty `.git` directory, so the copy reads as a repository. */
  readonly git?: boolean;
  /** Names the temporary directory. */
  readonly label: string;
  /** Directory holding the copy, created when missing; defaults to the system temporary directory. */
  readonly parent?: string;
  /** Removes the copy once the running test finishes; otherwise the caller does. */
  readonly removeAfterTest?: boolean;
  /** The directory copied. */
  readonly source: string;
}
