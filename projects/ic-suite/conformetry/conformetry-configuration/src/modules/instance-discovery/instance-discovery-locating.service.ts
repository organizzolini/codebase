import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  FILE_EXTENSION_PATTERN,
  GLOB_WILDCARD_CHARACTERS,
  INSTANCE_KEY_SEPARATOR,
} from "./instance-discovery.constants";

import type {
  FindInstancesArguments,
  Instance,
} from "./instance-discovery.types";

/**
 * Expands instance glob patterns into instances.
 *
 * The globs are the author's assertion of what was generated from a template;
 * nothing is inferred from directory names or marker files, which is what the
 * previous matcher did and what made it repo-specific.
 */
@Injectable()
export class InstanceDiscoveryLocatingService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Derives location substitutions, such as `type`.
   *
   * `type` is the top-level directory; a configured value still wins.
   */
  private deriveLocationSubstitutions(args: {
    instancePath: string;
    nameStem: string;
    workingDirectory: string;
  }): Record<string, string> {
    const [type = ""] = path
      .relative(
        args.workingDirectory,
        path.join(args.instancePath, args.nameStem),
      )
      .split(path.sep);

    // An instance at the working directory itself, or outside it, has no
    // top-level directory to answer with; the template's own default or a
    // configured value takes over rather than a nonsense one being invented.
    return type === "" || type === ".." ? {} : { type };
  }

  /** Expands one pattern, leaving out every path an exclude glob matches. */
  private globEntries(args: {
    exclude?: string[] | undefined;
    pattern: string;
    workingDirectory: string;
  }): fs.Dirent[] {
    return fs
      .globSync(args.pattern, {
        cwd: args.workingDirectory,
        withFileTypes: true,
      })
      .filter((entry) => {
        return !this.isExcluded({
          ...args,
          entryPath: path.join(entry.parentPath, entry.name),
        });
      });
  }

  /** Whether an exclude glob matches a found path, workspace-relative. */
  private isExcluded(args: {
    entryPath: string;
    exclude?: string[] | undefined;
    workingDirectory: string;
  }): boolean {
    const relativePath = path.relative(
      args.workingDirectory,
      path.resolve(args.workingDirectory, args.entryPath),
    );

    return (args.exclude ?? []).some((pattern) => {
      return path.matchesGlob(relativePath, pattern);
    });
  }

  /**
   * Returns the literal suffix a pattern ends with, or `""` if none.
   *
   * A file's name is what the glob did not spell out.
   */
  private resolveGlobSuffix(pattern: string): string {
    const basename = path.basename(pattern);
    const wildcardIndex = Math.max(
      ...GLOB_WILDCARD_CHARACTERS.map((character) => {
        return basename.lastIndexOf(character);
      }),
    );

    return wildcardIndex === -1 ? "" : basename.slice(wildcardIndex + 1);
  }

  /**
   * Derives an instance's name.
   *
   * Minus the glob's suffix, `differences.service.ts` and `differences.service.unit.test.ts` both give `differences`.
   */
  private resolveNameStem(args: {
    entryName: string;
    isDirectory: boolean;
    suffix: string;
  }): string {
    if (args.isDirectory) {
      return args.entryName;
    }

    if (args.suffix !== "" && args.entryName.endsWith(args.suffix)) {
      return args.entryName.slice(0, -args.suffix.length);
    }

    return args.entryName.replace(FILE_EXTENSION_PATTERN, "");
  }

  // 🌎 Public Methods

  /**
   * Expands every pattern into one instance per distinct path, name, and scope kind.
   *
   * Same-name file matches merge into one scoped instance.
   */
  public findInstances(args: FindInstancesArguments): Instance[] {
    const fileScopesByKey = new Map<string, Set<string> | undefined>();

    for (const pattern of args.patterns) {
      const suffix = this.resolveGlobSuffix(pattern);

      for (const entry of this.globEntries({ ...args, pattern })) {
        const isDirectory = entry.isDirectory();
        const entryPath = path.join(entry.parentPath, entry.name);

        // Always the parent, whether the glob matched a directory or a file:
        // a template that produces a folder contains that folder, so the tree
        // is laid over the folder's parent either way.
        const instancePath = entry.parentPath;
        const nameStem = this.resolveNameStem({
          entryName: entry.name,
          isDirectory,
          suffix,
        });
        const key = [
          instancePath,
          nameStem,
          isDirectory ? "directory" : "file",
        ].join(INSTANCE_KEY_SEPARATOR);

        if (isDirectory) {
          fileScopesByKey.set(key, undefined);
          continue;
        }

        const fileScope = fileScopesByKey.get(key) ?? new Set<string>();

        fileScope.add(entryPath);
        fileScopesByKey.set(key, fileScope);
      }
    }

    return [...fileScopesByKey.entries()]
      .toSorted(([left], [right]) => left.localeCompare(right))
      .map(([key, fileScope]) => {
        const [instancePath = "", nameStem = ""] = key.split(
          INSTANCE_KEY_SEPARATOR,
        );

        return {
          ...(fileScope === undefined
            ? {}
            : { fileScope: [...fileScope].toSorted() }),
          nameStem,
          // Spelled out rather than shorthand: `path` is the node module in
          // this scope, so the shorthand would bind the import.
          path: instancePath,
          substitutions: {
            ...this.deriveLocationSubstitutions({
              instancePath,
              nameStem,
              workingDirectory: args.workingDirectory,
            }),
            ...args.substitutions,
          },
          ...(args.threshold === undefined
            ? {}
            : { threshold: args.threshold }),
        };
      });
  }
}
