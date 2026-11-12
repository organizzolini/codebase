import { existsSync, readFileSync } from "node:fs";

import { Injectable } from "@nestjs/common";
import ignore from "ignore";

import type {
  CreateIgnoreScopeArguments,
  IgnoreScope,
  ReadIgnoreScopeArguments,
} from "./ignore-rules.types";

/**
 * Reads and applies gitignore-syntax rule sets without invoking git, so any directory can be measured. It is the only reader of that syntax.
 */
@Injectable()
export class IgnoreRulesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The path relative to a rule set's directory, or nothing when it lies outside. Patterns match against this, not the full path.
   */
  private toScopedPath(
    scope: IgnoreScope,
    relativePath: string,
  ): string | undefined {
    if (scope.directory === "") {
      return relativePath;
    }

    const prefix = `${scope.directory}/`;

    if (!relativePath.startsWith(prefix)) {
      return undefined;
    }

    return relativePath.slice(prefix.length);
  }

  // 🌎 Public Methods

  /**
   * Builds a rule set from patterns in hand. Always case-sensitive, so one ignore file claims the same files on every platform.
   */
  createScope(args: CreateIgnoreScopeArguments): IgnoreScope {
    return {
      directory: args.directory,
      matcher: ignore({ ignorecase: false }).add(args.patterns),
    };
  }

  /**
   * Whether the rule sets ignore a path, the innermost deciding. Scopes apply outermost first, so a nested `!pattern` can re-include a file.
   */
  isIgnored(scopes: readonly IgnoreScope[], relativePath: string): boolean {
    let isIgnored = false;

    for (const scope of scopes) {
      const scopedPath = this.toScopedPath(scope, relativePath);

      // An empty scoped path is the scope's own directory, which its patterns
      // are relative to and therefore can never claim.
      if (scopedPath === undefined || scopedPath === "") {
        continue;
      }

      const result = scope.matcher.test(scopedPath);

      if (result.ignored) {
        isIgnored = true;
      } else if (result.unignored) {
        isIgnored = false;
      }
    }

    return isIgnored;
  }

  /**
   * Reads a rule set from a gitignore-syntax file, or nothing when it is absent so the caller can report it.
   */
  readScope(args: ReadIgnoreScopeArguments): IgnoreScope | undefined {
    if (!existsSync(args.filePath)) {
      return undefined;
    }

    return this.createScope({
      directory: args.directory,
      patterns: readFileSync(args.filePath, "utf8").split("\n"),
    });
  }
}
