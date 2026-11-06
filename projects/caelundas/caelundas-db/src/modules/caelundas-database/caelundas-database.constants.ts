// ♟️ Constants

/** The project whose `CAELUNDAS_POSTGRES_*` variables, database, schema, and role every connection uses. */
export const CAELUNDAS_PROJECT = "caelundas";

/**
 * The digits a latitude or longitude column holds: nine in all, six after the
 * point, which fits `-180.000000` and keeps the fixed six decimals the
 * natural key has always compared.
 */
export const COORDINATE_PRECISION = 9;

/** The digits after the point in a latitude or longitude. */
export const COORDINATE_SCALE = 6;
