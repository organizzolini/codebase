import { Injectable } from "@nestjs/common";
import ts from "typescript";

/**
 * Builds compiler hosts that share parsed source files across programs.
 *
 * Every program pulls in the same lib and workspace files, so without sharing one
 * run re-reads them once per project. The cache key must name the script target,
 * or a file parsed at one target is silently reused at another.
 */
@Injectable()
export class CompilerHostService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  /**
   * Answers file-system questions module resolution asks, shared by every program
   * of a run and valid until `clear`.
   */
  private readonly directoryExistsCache = new Map<
    string,
    { answer: boolean }
  >();

  private readonly fileExistsCache = new Map<string, { answer: boolean }>();

  private readonly fileTextCache = new Map<
    string,
    { answer: string | undefined }
  >();
  private readonly moduleResolutionCaches = new Map<
    string,
    ts.ModuleResolutionCache
  >();
  private readonly realPathCache = new Map<string, { answer: string }>();
  /**
   * Keyed on file name and script target together, since one file parses to
   * different trees per target.
   */
  private readonly sourceFileCache = new Map<string, ts.SourceFile>();

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Wraps a one-argument host method so each distinct argument asks once. */
  private memoize<Value>(
    cache: Map<string, { answer: Value }>,
    ask: (key: string) => Value,
  ): (key: string) => Value {
    return (key: string): Value => {
      const cached = cache.get(key);

      if (cached !== undefined) {
        return cached.answer;
      }

      const answer = ask(key);
      cache.set(key, { answer });

      return answer;
    };
  }

  /** Returns the module resolution cache for one working directory. */
  private resolveModuleCache(
    options: ts.CompilerOptions,
    workspaceRoot: string,
  ): ts.ModuleResolutionCache {
    const existing = this.moduleResolutionCaches.get(workspaceRoot);

    if (existing !== undefined) {
      return existing;
    }

    const created = ts.createModuleResolutionCache(
      workspaceRoot,
      (fileName) => fileName,
      options,
    );
    this.moduleResolutionCaches.set(workspaceRoot, created);

    return created;
  }

  // 🌎 Public Methods

  /** Drops every cached source file, for a host that outlives one run. */
  public clear(): void {
    this.sourceFileCache.clear();
    this.directoryExistsCache.clear();
    this.fileExistsCache.clear();
    this.fileTextCache.clear();
    this.realPathCache.clear();
    this.moduleResolutionCaches.clear();
  }

  /**
   * Creates a compiler host that reuses parsed source files. `setParentNodes` is on
   * because the package reads `node.parent`, which needs it.
   */
  public createHost(args: {
    options: ts.CompilerOptions;
    workspaceRoot: string;
  }): ts.CompilerHost {
    const host = ts.createCompilerHost(args.options, true);
    const readSourceFile = host.getSourceFile.bind(host);

    this.resolveModuleCache(args.options, args.workspaceRoot);

    // Two parameters rather than the four the signature allows: `onError` and
    // `shouldCreateNewSourceFile` are only meaningful on a cache miss that this
    // host never produces differently, and taking all four would put the
    // callback over the repository's parameter limit for no gain.
    const readCached = (
      fileName: string,
      languageVersion: ts.CreateSourceFileOptions | ts.ScriptTarget,
    ): ts.SourceFile | undefined => {
      const target =
        typeof languageVersion === "object"
          ? languageVersion.languageVersion
          : languageVersion;
      const cacheKey = `${fileName} ${String(target)}`;
      const cached = this.sourceFileCache.get(cacheKey);

      if (cached !== undefined) {
        return cached;
      }

      const parsed = readSourceFile(fileName, languageVersion);

      if (parsed !== undefined) {
        this.sourceFileCache.set(cacheKey, parsed);
      }

      return parsed;
    };

    host.getSourceFile = readCached;
    host.fileExists = this.memoize(
      this.fileExistsCache,
      host.fileExists.bind(host),
    );
    host.readFile = this.memoize(this.fileTextCache, host.readFile.bind(host));

    const askDirectory = host.directoryExists?.bind(host);
    const askRealPath = host.realpath?.bind(host);

    if (askDirectory !== undefined) {
      host.directoryExists = this.memoize(
        this.directoryExistsCache,
        askDirectory,
      );
    }

    if (askRealPath !== undefined) {
      host.realpath = this.memoize(this.realPathCache, askRealPath);
    }

    return host;
  }
}
