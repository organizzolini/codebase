// ♟️ Constants

/**
 * An entity file set the command cannot read: a glob that names no file, or
 * entities that do not pick down to one. Its message names the option to fix.
 */
export class GraphEntitiesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = GraphEntitiesError.name;
  }
}

/** A `--entities` glob that matched no file. */
export const graphGlobMessage = (glob: string): string =>
  `--entities matched no files: ${glob}`;

/** No tree entity among the files `--entities` named. */
export const graphNoTreeMessage = (globs: readonly string[]): string =>
  `No @Tree entity matched --entities ${globs.join(", ")}; decorate an entity with @Tree, or point --entities at the file that defines it`;

/** `--table` names a table no tree entity has. */
export const graphNoTableMessage = (
  table: string,
  tables: readonly string[],
): string =>
  `No @Tree entity has table ${table}; the trees found are ${tables.join(", ")}`;

/** Several tree entities match and `--table` does not pick one. */
export const graphSeveralTreesMessage = (tables: readonly string[]): string =>
  `Several @Tree entities match --entities: ${tables.join(", ")}; name one with --table`;
