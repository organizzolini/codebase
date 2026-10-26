import { z } from "zod";

// 🔖 Schemas

/**
 * One catalog row: right ascension in hours, declination in degrees, apparent
 * magnitude, then the B−V color index.
 */
export const starRowSchema = z.tuple([
  z.number().min(0).max(24),
  z.number().min(-90).max(90),
  z.number(),
  z.number(),
]);

/**
 * The bundled catalog, checked when it loads so a malformed file fails loudly
 * and not as a blank sky.
 */
export const starCatalogSchema = z.array(starRowSchema);
