// ♟️ Constants

// Database packages use the domain name as their shared Postgres project key.
export const DATABASE_PROJECT = "caelundas-db".replace(/-db$/u, "");

/** Lat/long column digits: nine in all, six after the point. */
export const COORDINATE_PRECISION = 9;

/** The digits after the point in a latitude or longitude. */
export const COORDINATE_SCALE = 6;

/** The materialized view every metrics read comes from. */
export const METRICS_VIEW = "calendar_event_facts";

/** Refreshes the metrics view without blocking readers. */
export const METRICS_REFRESH_STATEMENT = `refresh materialized view concurrently ${METRICS_VIEW}`;
