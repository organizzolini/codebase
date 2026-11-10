import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { formatFiles } from "@nx/devkit";

import { FILE_ENCODING } from "./adapter.constants";

import type { CreateAdaptersArguments, TreeAdapters } from "./adapter.types";
import type { DirectoryEntry } from "@conformetry/generation";
import type { Tree } from "@nx/devkit";

/**
 * Backs generation with an Nx `Tree` instead of the filesystem.
 *
 * Lets `nx g --dry-run` and Nx's change preview work, since a `Tree` records writes until Nx flushes them.
 */
@Injectable()
export class AdapterService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Lists a directory through the tree inside the workspace.
   *
   * Lets a generator see edits made earlier in the same run.
   */
  private async listDirectory(args: {
    directoryPath: string;
    tree: Tree;
    workspaceRoot: string;
  }): Promise<DirectoryEntry[]> {
    const treePath = this.resolveTreePath(args);

    if (treePath === undefined) {
      return fs
        .readdirSync(args.directoryPath, { withFileTypes: true })
        .map((entry) => {
          return { isDirectory: entry.isDirectory(), name: entry.name };
        });
    }

    return await Promise.resolve(
      args.tree.children(treePath).map((name) => {
        return {
          isDirectory: !args.tree.isFile([treePath, name].join("/")),
          name,
        };
      }),
    );
  }

  /** Reads a file through the tree when possible, the filesystem otherwise. */
  private async readFile(args: {
    filePath: string;
    tree: Tree;
    workspaceRoot: string;
  }): Promise<string> {
    const treePath = this.resolveTreePath({
      directoryPath: args.filePath,
      workspaceRoot: args.workspaceRoot,
    });
    const contents =
      treePath === undefined ? null : args.tree.read(treePath, FILE_ENCODING);

    return await Promise.resolve(
      contents ?? fs.readFileSync(args.filePath, FILE_ENCODING),
    );
  }

  /**
   * Converts an absolute path to the workspace-relative form a `Tree` uses,
   * or returns `undefined` when the path lies outside the workspace.
   */
  private resolveTreePath(args: {
    directoryPath: string;
    workspaceRoot: string;
  }): string | undefined {
    const relativePath = path.relative(args.workspaceRoot, args.directoryPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      return undefined;
    }

    return relativePath.split(path.sep).join("/");
  }

  // 🌎 Public Methods

  /**
   * Builds the adapters one generator run writes through.
   *
   * `makeDirectory` is a no-op, since a `Tree` implies directories from file paths.
   */
  public createAdapters(args: CreateAdaptersArguments): TreeAdapters {
    return {
      filesystem: {
        listDirectory: async (directoryPath: string) => {
          return await this.listDirectory({
            directoryPath,
            tree: args.tree,
            workspaceRoot: args.workspaceRoot,
          });
        },
        makeDirectory: async () => {
          await Promise.resolve();
        },
        readFile: async (filePath: string) => {
          return await this.readFile({
            filePath,
            tree: args.tree,
            workspaceRoot: args.workspaceRoot,
          });
        },
        writeFile: async (filePath: string, content: string) => {
          const treePath = this.resolveTreePath({
            directoryPath: filePath,
            workspaceRoot: args.workspaceRoot,
          });

          args.tree.write(treePath ?? filePath, content);

          await Promise.resolve();
        },
      },
      formatter: {
        formatFiles: async () => {
          await formatFiles(args.tree);
        },
      },
    };
  }
}
