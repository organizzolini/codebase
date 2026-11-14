import type { MeandersQuery } from "../../graphql/generated/operations";

// 🏷️ Types

/**
 * One meander a card shows.
 */
export type GalleryMeander = MeandersPage["edges"][number]["node"];

/**
 * One page of the meanders connection, as the API returns it.
 */
export type MeandersPage = MeandersQuery["meanders"];
