// ♟️ Constants

/**
 * Sentinel UUID identifying the lexico-ingestion process as the author of
 * all records it creates or updates. Used for `createdBy` / `updatedBy`.
 */
export const LEXICO_INGESTION_BY_ID = "02e585d7-e8b0-412c-b9a8-0e5a65820ea7";

/**
 * The "None" choice's value. `prompts` falls back to a title for a falsy value,
 * so `null` would come back as the string "None".
 */
export const NO_SELECTION_CHOICE = "__no-selection__";
