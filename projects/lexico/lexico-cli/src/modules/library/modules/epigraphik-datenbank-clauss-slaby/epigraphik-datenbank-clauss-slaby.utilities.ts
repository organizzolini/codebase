// `obj` is the field name the EDCS API returns, not an abbreviation this code chose.
// cspell:ignore obj fundort inschrifttyp datierung

import type { EpigraphikDatenbankRecord } from "./epigraphik-datenbank-clauss-slaby.types";

/** Frontmatter keys for the province and each attribute; a missing one is undefined. */
export function buildEdcsAttributes(
  object: EpigraphikDatenbankRecord["obj"],
  province: string,
): Record<string, number | string | undefined> {
  return {
    end_year: object.datierung_bis ?? undefined,
    find_spot: object.fundort ?? undefined,
    inscription_type: object.inschrifttyp ?? undefined,
    material: object.material ?? undefined,
    province,
    start_year: object.datierung_von ?? undefined,
  };
}
