import type { CharacteristicRecord } from "../src/modules/meanderaw-database/meanderaw-database.types";

/** Builds a catalog row with defaults; a key starting with `is` is a boolean. */
export function characteristicRecord(
  key: string,
  overrides: Partial<CharacteristicRecord> = {},
): CharacteristicRecord {
  return {
    category: "path",
    description: `How ${key} measures a meander.`,
    documentationUrl: null,
    formula: null,
    isPattern: false,
    key,
    name: key,
    valueType: key.startsWith("is") ? "boolean" : "number",
    ...overrides,
  };
}

/** Catalog rows for each of `keys`, as a draw run would register them. */
export function characteristicRecords(
  keys: readonly string[],
): CharacteristicRecord[] {
  return keys.map((key) => characteristicRecord(key));
}
