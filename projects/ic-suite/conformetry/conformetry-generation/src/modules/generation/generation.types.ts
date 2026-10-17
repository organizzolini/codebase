// 🏷️ Types

import type { FileSystemAdapter, GeneratorDefinition } from "@conformetry/core";

/**
 * Formatting applied once generation completes.
 *
 * The default is a no-op: formatting is the host's concern, and a plain CLI
 * run leaves files to the workspace formatter.
 */
export interface FormatterAdapter {
  formatFiles(filePaths: string[]): Promise<void>;
}

/**
 * Arguments accepted by the runtime runner.
 */
export interface RunGeneratorArguments {
  definition: GeneratorDefinition;
  filesystem?: FileSystemAdapter;
  formatter?: FormatterAdapter;
  inputs?: Record<string, string | undefined>;
  /**
   * The directory the template's tree is rendered into.
   *
   * A template that should produce a folder contains that folder, so this is
   * the folder's parent. Nothing here derives a path — the caller decides
   * where an instance goes, because that is workspace knowledge.
   */
  instancePath: string;
}

/**
 * Result returned by the runtime runner.
 */
export interface RunGeneratorResult {
  generatedFilePaths: string[];
  outputDirectoryPath: string;
}
