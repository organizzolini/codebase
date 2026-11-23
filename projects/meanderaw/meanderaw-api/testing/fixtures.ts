import type {
  CharacteristicRecord,
  MeanderRecord,
} from "@codebase/meanderaw-db";

/** A catalog row with defaults; a key starting with `is` is a boolean. */
export function catalogEntry(
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

/** A meander row with defaults, so a case spells out only what it is about. */
export function meanderRow(
  overrides: Partial<MeanderRecord> & Pick<MeanderRecord, "code">,
): MeanderRecord {
  return {
    characteristics: {},
    columns: 1,
    isHardcoded: true,
    lattice: "0",
    repeats: 1,
    rows: 1,
    symmetricalCodes: [],
    ...overrides,
  };
}
