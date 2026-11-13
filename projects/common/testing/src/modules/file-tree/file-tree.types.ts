/** What `createFileTree` adds around the files it writes. */
export interface FileTreeOptions {
  /** Creates an empty `.git` directory, so the root reads as a repository. */
  readonly git?: boolean;
  /** Names the temporary directory; defaults to `file-tree`. */
  readonly label?: string;
  /** Directory holding the root, created when missing; defaults to the system temporary directory. */
  readonly parent?: string;
  /** Symbolic links to make, each `linkPath` to a `targetPath` under the root. */
  readonly symlinks?: Readonly<Record<string, string>>;
}
