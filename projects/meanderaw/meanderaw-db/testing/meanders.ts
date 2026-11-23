import type { MeanderRecord } from "../src/modules/database/database.types";

/**
 * Builds a meander row with every field defaulted, so a case spells out only the
 * fields it is about.
 */
export function meanderRecord(
  overrides: Partial<MeanderRecord> & Pick<MeanderRecord, "code">,
): MeanderRecord {
  return {
    characteristics: {},
    columns: 1,
    isHardcoded: true,
    lattice: "0",
    repeats: 1,
    rows: 2,
    symmetricalCodes: [],
    ...overrides,
  };
}
