import path from "node:path";

import { Injectable } from "@nestjs/common";

import { ROOT_DIRECTORY } from "./tree.constants";

import type { MeasureTreeArguments, TreeBreach } from "./tree.types";

/**
 * Measures the shape of a file tree: how many entries each directory holds, and how deep directories nest.
 *
 * The tree is rebuilt from discovered file paths, so an ignored file is never an entry.
 */
@Injectable()
export class TreeService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Maps each directory to the names of its direct entries. */
  private collectEntries(files: string[]): Map<string, Set<string>> {
    const entries = new Map<string, Set<string>>();

    for (const file of files) {
      const segments = file.split("/");

      for (const [index, segment] of segments.entries()) {
        const directory = segments.slice(0, index).join("/");
        const names = entries.get(directory) ?? new Set<string>();

        names.add(segment);
        entries.set(directory, names);
      }
    }

    return entries;
  }

  /** Whether a directory, or any directory above it, matches an exclusion glob. */
  private isExcluded(directory: string, exclude: string[]): boolean {
    const segments = directory === "" ? [] : directory.split("/");

    return segments.some((_segment, index) => {
      const ancestor = segments.slice(0, index + 1).join("/");

      return exclude.some((pattern) => path.matchesGlob(ancestor, pattern));
    });
  }

  /** Names a directory as a breach reports it. */
  private nameDirectory(directory: string): string {
    return directory === "" ? ROOT_DIRECTORY : directory;
  }

  // 🌎 Public Methods

  /** Every judged directory holding more direct entries than the maximum. */
  measureBreadth(args: MeasureTreeArguments): TreeBreach[] {
    return [...this.collectEntries(args.files)]
      .filter(
        ([directory, names]) =>
          names.size > args.maximum &&
          !this.isExcluded(directory, args.exclude),
      )
      .map(([directory, names]) => ({
        directory: this.nameDirectory(directory),
        measured: names.size,
      }))
      .toSorted((left, right) => left.directory.localeCompare(right.directory));
  }

  /**
   * Every shallowest judged directory sitting deeper than the maximum, measured by its deepest judged descendant.
   */
  measureDepth(args: MeasureTreeArguments): TreeBreach[] {
    const deepest = new Map<string, number>();

    for (const directory of this.collectEntries(args.files).keys()) {
      const segments = directory === "" ? [] : directory.split("/");

      if (
        segments.length > args.maximum &&
        !this.isExcluded(directory, args.exclude)
      ) {
        const breach = segments.slice(0, args.maximum + 1).join("/");

        deepest.set(
          breach,
          Math.max(deepest.get(breach) ?? 0, segments.length),
        );
      }
    }

    return [...deepest]
      .map(([directory, measured]) => ({ directory, measured }))
      .toSorted((left, right) => left.directory.localeCompare(right.directory));
  }
}
