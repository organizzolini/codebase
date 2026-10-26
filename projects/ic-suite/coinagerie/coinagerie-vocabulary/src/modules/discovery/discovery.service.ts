import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { GIT_DIRECTORY_NAME, GITIGNORE_FILE_NAME } from "./discovery.constants";
import { IgnoreRulesService } from "./ignore-rules.service";

import type {
  DiscoverArguments,
  IgnoreScope,
  WalkArguments,
} from "./discovery.types";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Lists the files a run scans.
 *
 * Every `.gitignore` git would honor is honored — those inside the root, and
 * those above it up to the repository root — and then the configuration's
 * own `include` and `exclude.paths` globs decide among what is left.
 */
@Injectable()
/* v8 ignore stop */
export class DiscoveryService {
  // 🏗 Dependency Injection

  constructor(private readonly ignoreRulesService: IgnoreRulesService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The nearest folder at or above the root holding a `.git` entry, or the
   * root itself outside any repository. A worktree's `.git` is a file, which
   * counts the same.
   */
  private findRepositoryRoot(directory: string): string {
    for (let candidate = directory; ; candidate = path.dirname(candidate)) {
      if (existsSync(path.join(candidate, GIT_DIRECTORY_NAME))) {
        return candidate;
      }

      if (path.dirname(candidate) === candidate) {
        return directory;
      }
    }
  }

  /** Whether the configuration's globs keep a root-relative file. */
  private isSelected(args: DiscoverArguments, relativePath: string): boolean {
    return (
      args.include.some((pattern) => path.matchesGlob(relativePath, pattern)) &&
      !args.exclude.some((pattern) => path.matchesGlob(relativePath, pattern))
    );
  }

  /**
   * The ignore files of every folder from the repository root down to, but
   * not including, the scan root — whose own file the walk reads.
   */
  private readAncestorScopes(
    repositoryRoot: string,
    directory: string,
  ): IgnoreScope[] {
    const segments = this.toPosix(path.relative(repositoryRoot, directory))
      .split("/")
      .filter((segment) => segment !== "");

    return segments.flatMap((_segment, index) => {
      const base = segments.slice(0, index).join("/");
      const scope = this.ignoreRulesService.readScope({
        base,
        filePath: path.join(repositoryRoot, base, GITIGNORE_FILE_NAME),
      });

      return scope === undefined ? [] : [scope];
    });
  }

  /** A path with forward slashes, which is what every glob is written in. */
  private toPosix(relativePath: string): string {
    return relativePath.split(path.sep).join("/");
  }

  /**
   * Every file under one folder that no ignore file claims, as absolute
   * paths. Symbolic links are skipped rather than followed, so nothing is
   * read twice and a link to an ancestor cannot loop.
   */
  private walk(args: WalkArguments): string[] {
    const base = this.toPosix(
      path.relative(args.repositoryRoot, args.absoluteDirectory),
    );
    const ownScope = this.ignoreRulesService.readScope({
      base,
      filePath: path.join(args.absoluteDirectory, GITIGNORE_FILE_NAME),
    });
    const scopes =
      ownScope === undefined ? args.scopes : [...args.scopes, ownScope];

    return readdirSync(args.absoluteDirectory, { withFileTypes: true })
      .filter(
        (entry) => !entry.isSymbolicLink() && entry.name !== GIT_DIRECTORY_NAME,
      )
      .flatMap((entry) => {
        const absolutePath = path.join(args.absoluteDirectory, entry.name);
        const relativePath = base === "" ? entry.name : `${base}/${entry.name}`;
        const isDirectory = entry.isDirectory();

        if (
          this.ignoreRulesService.isIgnored(
            scopes,
            isDirectory ? `${relativePath}/` : relativePath,
          )
        ) {
          return [];
        }

        return isDirectory
          ? this.walk({ ...args, absoluteDirectory: absolutePath, scopes })
          : [absolutePath];
      });
  }

  // 🌎 Public Methods

  /**
   * Every file the run scans, relative to the root, sorted so the same tree
   * yields the same list on every machine.
   */
  discover(args: DiscoverArguments): string[] {
    const repositoryRoot = this.findRepositoryRoot(args.directory);
    const skip = new Set(args.skip.map((skipped) => path.resolve(skipped)));

    return this.walk({
      absoluteDirectory: args.directory,
      repositoryRoot,
      scopes: this.readAncestorScopes(repositoryRoot, args.directory),
    })
      .filter((absolutePath) => !skip.has(absolutePath))
      .map((absolutePath) =>
        this.toPosix(path.relative(args.directory, absolutePath)),
      )
      .filter((relativePath) => this.isSelected(args, relativePath))
      .toSorted();
  }
}
