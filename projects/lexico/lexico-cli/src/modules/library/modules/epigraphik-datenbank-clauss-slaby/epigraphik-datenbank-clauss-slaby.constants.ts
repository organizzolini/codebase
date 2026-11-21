// ♟️ Constants

// `obj` is the field name the EDCS API returns, not an abbreviation this code chose.
// cspell:ignore obj fundort inschrifttyp datierung

import { z } from "zod";

export const epigraphikDatenbankChunkResponseSchema = z.object({
  data: z.array(z.unknown()),
});

/** An optional attribute; a wrong-shaped value reads as absent. */
const optionalAttribute = <T extends z.ZodType>(
  schema: T,
): z.ZodCatch<z.ZodOptional<z.ZodNullable<T>>> => schema.nullish().catch(null);

// Attribute field names are unverified against the live API (it returned 403), so a wrong name
// nulls that attribute; the run's coverage log and warning expose it.
/** One EDCS record: id and inscriptions required, the rest optional. */
export const epigraphikDatenbankRecordSchema = z.object({
  obj: z
    .object({
      datierung_bis: optionalAttribute(z.number().int()),
      datierung_von: optionalAttribute(z.number().int()),
      "edcs-id": z.string().optional(),
      edcsId: z.string().optional(),
      fundort: optionalAttribute(z.string()),
      inschriften: z.array(z.tuple([z.string()]).rest(z.unknown())),
      inschrifttyp: optionalAttribute(z.string()),
      material: optionalAttribute(z.string()),
      provinz: optionalAttribute(z.string()),
    })
    .refine((object) => Boolean(object["edcs-id"] || object.edcsId), {
      message: "EDCS record has no id",
    }),
});

/** Missing share of records that warns of a wrong field name. */
export const MISSING_SHARE_WARNING = 0.95;

/** Fewer records than this prove nothing about a field name. */
export const MINIMUM_RECORDS_FOR_WARNING = 10;
