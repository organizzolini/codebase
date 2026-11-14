/** The stubbed members of a file-system module, by name. */
export type FileSystemFunctions = Readonly<Record<string, unknown>>;

/** A file-system `vi.mock` module whose `default` mirrors its named exports. */
export type FileSystemMock = FileSystemFunctions & {
  readonly default: FileSystemFunctions;
};
