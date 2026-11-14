import { z } from "zod";

// ♟️ Constants

/**
 * The two ways the gallery lays its cards out.
 */
export const GALLERY_VIEWS = ["grid", "list"] as const;

/**
 * The view a link opens on when it names none.
 */
export const DEFAULT_GALLERY_VIEW = "grid" as const;

/**
 * Validates the link's search parameters, dropping any that is not valid.
 */
export const gallerySearchSchema = z.object({
  view: z.enum(GALLERY_VIEWS).catch(DEFAULT_GALLERY_VIEW).optional(),
});
