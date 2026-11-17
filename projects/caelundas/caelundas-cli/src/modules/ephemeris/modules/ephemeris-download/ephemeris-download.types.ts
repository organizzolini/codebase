import type { EPHEMERIS_FILENAMES } from "./ephemeris-download.constants";

// 🏷️ Types

/** The name of one Swiss Ephemeris data file. */
export type EphemerisFilename = (typeof EPHEMERIS_FILENAMES)[number];
