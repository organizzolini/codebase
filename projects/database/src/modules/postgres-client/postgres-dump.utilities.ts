import {
  POSTGRES_DUMP_DEPENDENCIES_PATTERN,
  POSTGRES_DUMP_ENTRY_PATTERN,
  POSTGRES_DUMP_HEADER_PATTERN,
  POSTGRES_DUMP_MISSING_TABLE_PATTERN,
  POSTGRES_DUMP_TABLE_DATA_PATTERN,
  POSTGRES_DUMP_TABLE_PATTERN,
} from "./postgres-client.constants";

import type {
  PostgresDumpEntry,
  PostgresDumpEntryKind,
} from "./postgres-client.types";

// 🌎 Utilities

/**
 * The schema-qualified tables whose definitions (`table`) or rows (`data`)
 * a dump holds.
 */
export function dumpedTables(
  entries: readonly PostgresDumpEntry[],
  kind: "data" | "table",
): Set<string> {
  return new Set(
    entries.flatMap((entry) =>
      entry.kind === kind && entry.table !== undefined ? [entry.table] : [],
    ),
  );
}

/**
 * The tables `pg_dump --strict-names` reports it found nothing for, as
 * schema-qualified in its error text; empty for any other failure.
 */
export function missingDumpTables(detail: string): string[] {
  return [...detail.matchAll(POSTGRES_DUMP_MISSING_TABLE_PATTERN)].map(
    ([, table]) => String(table),
  );
}

/**
 * Reads the entries of a dump's table of contents from the output of
 * `pg_restore --list --verbose`, in dump order, which is dependency order.
 */
export function parsePostgresDumpContents(
  listing: string,
): PostgresDumpEntry[] {
  const entries: PostgresDumpEntry[] = [];

  for (const line of listing.split("\n")) {
    const entry = POSTGRES_DUMP_ENTRY_PATTERN.exec(line);
    if (entry !== null) {
      entries.push({
        dependencies: [],
        id: Number(entry[1]),
        ...describeEntry(entry[2] ?? ""),
      });
      continue;
    }

    // A `depends on:` comment belongs to the entry printed just before it.
    const dependencies = POSTGRES_DUMP_DEPENDENCIES_PATTERN.exec(line)?.[1];
    const last = entries.at(-1);
    if (dependencies === undefined || last === undefined) continue;
    entries[entries.length - 1] = {
      ...last,
      dependencies: dependencyIds(dependencies),
    };
  }

  return entries;
}

/**
 * The ids of the entries to restore for `tables`: each table's definition
 * and rows, every entry that depends only on what is selected (its
 * indexes, constraints, defaults, comments, and owned sequences), and the
 * session headers. A foreign key to a table left out is left out with it.
 *
 * An entry that depends on nothing in the dump, such as a data-only
 * dump's sequence value, cannot be attributed to a table, so it is
 * selected only when `tables` is every table the dump holds.
 */
export function selectPostgresDumpEntries(
  entries: readonly PostgresDumpEntry[],
  tables: readonly string[],
): number[] {
  const wanted = new Set(tables);
  const dumped = new Set(entries.map(({ id }) => id));
  const whole = entries.every(
    ({ table }) => table === undefined || wanted.has(table),
  );
  const selected = new Set<number>();

  for (const entry of entries) {
    const present = entry.dependencies.filter((id) => dumped.has(id));
    const keep =
      entry.table === undefined
        ? entry.kind === "header" ||
          (present.length === 0
            ? whole
            : present.every((id) => selected.has(id)))
        : wanted.has(entry.table);
    if (keep) selected.add(entry.id);
  }

  return [...selected];
}

/** The ids listed after `depends on:`. */
function dependencyIds(list: string): number[] {
  return list
    .split(/\s+/u)
    .filter((id) => id !== "")
    .map(Number);
}

/** What an entry is, from the description after its object ids. */
function describeEntry(
  description: string,
): Pick<PostgresDumpEntry, "kind" | "table"> {
  const data = POSTGRES_DUMP_TABLE_DATA_PATTERN.exec(description)?.[1];
  if (data !== undefined) return tableEntry("data", data);

  const table = POSTGRES_DUMP_TABLE_PATTERN.exec(description)?.[1];
  if (table !== undefined) return tableEntry("table", table);

  return {
    kind: POSTGRES_DUMP_HEADER_PATTERN.test(description) ? "header" : "other",
  };
}

/**
 * A table or data entry for `tag`, `schema name… owner`: the schema, the
 * name, which may hold spaces, and the owner, which cannot.
 */
function tableEntry(
  kind: PostgresDumpEntryKind,
  tag: string,
): Pick<PostgresDumpEntry, "kind" | "table"> {
  const [schema, ...rest] = tag.split(" ");
  return { kind, table: `${schema ?? ""}.${rest.slice(0, -1).join(" ")}` };
}
