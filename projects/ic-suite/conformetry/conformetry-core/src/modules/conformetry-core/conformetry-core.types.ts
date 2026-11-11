// 🏷️ Types

/** A conformance error from any validator, rendered by `ReportingService`. */
export interface ConformetryDifference {
  /** Actual value found in the instance (populated for value-mismatch differences). */
  readonly actual?: string;
  /** Category of missing element. */
  readonly differenceType: ConformetryDifferenceType;
  /** Snippet of the template content that should be present in the instance. */
  readonly expected?: string;
  /** One-line actionable suggestion for the reader (human or coding agent). */
  readonly fix: string;
  /** 1-based column number in the instance file where the error was detected. */
  readonly instanceColumn?: number;
  /** 1-based line number in the instance file where the error was detected. */
  readonly instanceLine?: number;
  /** JSON dot-notation path in the instance document, e.g. `"scripts.build[0]"`. */
  readonly instancePath?: string;
  /**
   * File format of the validator that produced this error.
   * Absent for `"file"` and `"directory"` differences.
   */
  readonly language?: ConformetryDifferenceLanguage;
  /** Short human-readable description of what is missing. */
  readonly message: string;
  /** 1-based column number in the rendered template that defines the requirement. */
  readonly templateColumn?: number;
  /** 1-based line number in the rendered template that defines the requirement. */
  readonly templateLine?: number;
  /** JSON dot-notation path in the template document. */
  readonly templatePath?: string;
  /**
   * Requirements this finding stands for: a missing class covers its whole
   * subtree, a missing import only itself. Defaults to 1.
   */
  readonly weight?: number;
}

/** Validator's language or format; absent for `"file"` and `"directory"` errors. */
export type ConformetryDifferenceLanguage =
  | "javascript"
  | "json"
  | "markdown"
  | "python"
  | "text"
  | "typescript";

/** Failing element kind: `"instance"` is unexplained output, `"placeholder"` is unrevealed. */
export type ConformetryDifferenceType =
  | "code"
  | "comment"
  | "directory"
  | "file"
  | "instance"
  | "placeholder";
// 🏷️ Types

/** A validator for one format; supplies a descriptor and document comparison. */
export interface ConformetryLanguageValidator {
  readonly descriptor: LanguageValidatorDescriptor;
  /**
   * Compares one rendered template with its instance, returning every difference
   * and the weight asked of the instance. Only called for claimed extensions.
   */
  validateDocument(
    document: PreparedValidationDocument,
  ): DocumentValidationResult;
}

/**
 * A directory entry read from the source template tree.
 */
export interface DirectoryEntry {
  isDirectory: boolean;
  name: string;
}

/** One document's differences and the weight they were measured against. */
export interface DocumentValidationResult {
  /**
   * The instance text each placeholder value stood for, keyed by that value.
   * Absent when a language captures nothing.
   */
  readonly captures?: Readonly<Record<string, string>>;
  readonly differences: ConformetryDifference[];
  /** Combined weight of the template requirements this document imposes. */
  readonly totalWeight: number;
}

/** Filesystem operations, letting a virtual host like Nx's `Tree` skip disk. */
export interface FileSystemAdapter {
  listDirectory(directoryPath: string): Promise<DirectoryEntry[]>;
  makeDirectory(directoryPath: string): Promise<void>;
  readFile(filePath: string): Promise<string>;
  writeFile(filePath: string, content: string): Promise<void>;
}

/**
 * Generator metadata and runtime configuration.
 */
export interface GeneratorDefinition {
  description?: string;
  hooks?: GeneratorHooks;
  name: string;
  templateDirectoryPath: string;
}

/**
 * A generator hook function.
 */
export type GeneratorHook = (
  context: GeneratorHookContext,
) => Promise<void> | void;

/**
 * Data exposed to generator hooks.
 */
export interface GeneratorHookContext {
  /**
   * Absolute directory of the configuration file that declared the generator.
   * Hooks build paths belonging to the configuration here, not to the instance.
   */
  configurationDirectoryPath: string;
  definition: GeneratorDefinition;
  /**
   * The adapter the run reads and writes through. A hook writing here lands
   * wherever the host writes: disk, or a virtual tree under Nx.
   */
  filesystem: FileSystemAdapter;
  generatedFilePaths: string[];
  input: Record<string, string>;
  outputDirectoryPath: string;
  substitutions: Record<string, string>;
}

/**
 * Generator lifecycle hooks.
 */
export interface GeneratorHooks {
  postGenerate?: GeneratorHook;
  preGenerate?: GeneratorHook;
}

/** How well a matched instance honours its template, shared across layers. */
export interface InstanceScore {
  /** Combined weight of the requirements this instance failed. */
  readonly failedWeight: number;
  readonly instancePath: string;
  /** Whether the score reached the threshold that applies to this instance. */
  readonly ok: boolean;
  /** Share of the template's requirements honoured, from 0 to 1. */
  readonly score: number;
  readonly templateName: string;
  /** The threshold that applied, after resolving every level. */
  readonly threshold: number;
  /** Combined weight of the requirements that were checked. */
  readonly totalWeight: number;
}
// 🏷️ Types

/** An instance on disk, with the templates that explain it. */
export interface InventoriedInstance {
  /** Where the instance is, including its name stem. */
  readonly path: string;
  /** Templates that explain this instance, best fit first. */
  readonly templates: InventoriedPairing[];
}

/** Fit between a template and instance: file overlap, not conformance. */
export interface InventoriedPairing {
  readonly matchedFileCount: number;
  /** Share of the template's files the instance already has, 0 to 1. */
  readonly matchRatio: number;
  /** The other side of the pairing — a template name or an instance path. */
  readonly name: string;
  readonly templateFileCount: number;
}

/** One declared template, paired with the instances it explains. */
export interface InventoriedTemplate {
  readonly description: string;
  /** Instances this template explains, empty when nothing matched it. */
  readonly instances: InventoriedPairing[];
  readonly name: string;
  readonly templatePath: string;
}

/** Identifies a language validator and declares which files it claims. */
export interface LanguageValidatorDescriptor {
  /** Human-readable summary shown in CLI help and reports. */
  readonly description?: string;
  /** Extensions this validator claims, including the leading dot. */
  readonly fileExtensions: readonly string[];
  /** Stable identifier, also usable as a `--languages` filter value. */
  readonly name: string;
}

/** Outcome of running one language validator over a document set. */
export interface LanguageValidatorResult {
  readonly checkedPaths: string[];
  readonly fileResults: ValidationFileResult[];
  readonly languageName: string;
  readonly ok: boolean;
  /**
   * Combined weight of every document this validator claimed, conforming ones
   * included — see `DocumentValidationResult.totalWeight`.
   */
  readonly totalWeight: number;
}

/** A template and the instance file it governs, rendered with substitutions. */
export interface PreparedValidationDocument {
  /** Basename of the instance file, used to pick a parser. */
  readonly filename: string;
  /** Verbatim contents of the instance file. */
  readonly instance: string;
  /** Absolute path to the instance file, used in error messages. */
  readonly instanceFilePath: string;
  /** Template contents after substitutions have been applied. */
  readonly renderedTemplate: string;
  /** Absolute path to the source template, used in error messages. */
  readonly templateFilePath: string;
}

/** The document pairs discovered for one validation run. */
export interface PreparedValidationPayload {
  readonly checkedPaths: string[];
  readonly documents: PreparedValidationDocument[];
}
// 🏷️ Types

/** Errors found in one instance file, for a per-file report heading. */
export interface ValidationFileResult {
  readonly differences: ConformetryDifference[];
  readonly filename: string;
  readonly instanceFilePath: string;
  readonly templateFilePath: string;
  /** Combined weight of the template requirements checked in this file. */
  readonly totalWeight: number;
}
