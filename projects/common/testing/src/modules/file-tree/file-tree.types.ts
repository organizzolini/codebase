/** What `createFileTree` adds around the files it writes. */
export interface FileTreeOptions {
  /** Creates an empty `.git` directory, so the root reads as a repository. */
  readonly git?: boolean;
  /** Names the temporary directory; defaults to `file-tree`. */
  readonly label?: string;
  /** Holds the root instead of the system's temporary directory, created when missing. A command spawned from the root resolves its packages only inside the workspace, so it needs a parent there. */
  readonly parent?: string;
  /** Symbolic links to make, each `linkPath` to a `targetPath` under the root. */
  readonly symlinks?: Readonly<Record<string, string>>;
}
