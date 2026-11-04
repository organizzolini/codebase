import { existsSync, readFileSync } from "node:fs";

import { Injectable } from "@nestjs/common";
import ignore from "ignore";

import type { IgnoreScope, ReadIgnoreScopeArguments } from "./discovery.types";

/**
 * Reads `.gitignore` files and judges paths against them, without git.
 *
 * Reading the syntax here rather than asking git is what lets a run scan a
 * folder that is not a repository at all.
 */
@Injectable()
export class IgnoreRulesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** A path as a scope sees it, or `undefined` when it lies outside the scope. */
  private toScopedPath(
    scope: IgnoreScope,
    relativePath: string,
  ): string | undefined {
    if (scope.base === "") {
      return relativePath;
    }

    const prefix = `${scope.base}/`;

    return relativePath.startsWith(prefix)
      ? relativePath.slice(prefix.length)
      : undefined;
  }

  // 🌎 Public Methods

  /**
   * Whether the scopes ignore a repository-relative path, the innermost
   * deciding — which is how a nested `!pattern` re-includes a file its parent
   * ignored. A folder is judged with a trailing slash.
   */
  isIgnored(scopes: IgnoreScope[], relativePath: string): boolean {
    let ignored = false;

    for (const scope of scopes) {
      const scopedPath = this.toScopedPath(scope, relativePath);

      if (scopedPath === undefined) {
        continue;
      }

      const verdict = scope.matcher.test(scopedPath);

      if (verdict.ignored || verdict.unignored) {
        ignored = verdict.ignored;
      }
    }

    return ignored;
  }

  /**
   * Reads one ignore file, or `undefined` when it does not exist.
   *
   * Case-sensitive on every platform, so the same file ignores the same paths
   * on a developer's machine and in CI.
   */
  readScope(args: ReadIgnoreScopeArguments): IgnoreScope | undefined {
    if (!existsSync(args.filePath)) {
      return undefined;
    }

    return {
      base: args.base,
      matcher: ignore({ ignorecase: false }).add(
        readFileSync(args.filePath, "utf8"),
      ),
    };
  }
}
