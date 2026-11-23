import { SINGLE_QUOTED_LITERAL } from "./typeorm-migration-sql.constants";

// 🌎 Utilities

/**
 * Normalizes SQL so raw and lint-formatted files compare equal. Literals stay
 * verbatim.
 */
export function normalizeSql(sql: string): string {
  const parts = sql.split(SINGLE_QUOTED_LITERAL);
  let normalized = "";
  for (const [index, part] of parts.entries()) {
    normalized +=
      index % 2 === 1
        ? part
        : part
            .toLowerCase()
            .replaceAll('"', "")
            .replaceAll(/\s+/gu, " ")
            .replaceAll(/ ?([(),;]) ?/gu, "$1");
  }
  return normalized.trim().replace(/;$/u, "");
}
