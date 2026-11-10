// 🏷️ Types

import type { FileSystemAdapter, GeneratorDefinition } from "@conformetry/core";

/**
 * Formatting applied once generation completes.
 *
 * The default is a no-op, so formatting is left to the host.
 */
export interface FormatterAdapter {
  formatFiles(filePaths: string[]): Promise<void>;
}

/**
 * Arguments accepted by the runtime runner.
 */
export interface RunGeneratorArguments {
  /**
   * Absolute directory of the configuration file that declared the generator.
   * Handed to hooks unchanged; the runtime derives nothing from it.
   */
  configurationDirectoryPath: string;
  definition: GeneratorDefinition;
  filesystem?: FileSystemAdapter;
  formatter?: FormatterAdapter;
  inputs?: Record<string, string | undefined>;
  /**
   * The directory the template's tree is rendered into: for a folder-producing
   * template, the folder's parent. The caller decides the location.
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
