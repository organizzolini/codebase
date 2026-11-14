import type {
  CharacteristicsQuery,
  MeandersQuery,
} from "../../graphql/generated/operations";

// 🏷️ Types

/**
 * One characteristic the catalog offers, as a field to sort by.
 */
export type GalleryCharacteristic =
  CharacteristicsQuery["characteristics"][number];

/**
 * One meander a card shows.
 */
export type GalleryMeander = MeandersPage["edges"][number]["node"];

/**
 * One page of the meanders connection, as the API returns it.
 */
export type MeandersPage = MeandersQuery["meanders"];
