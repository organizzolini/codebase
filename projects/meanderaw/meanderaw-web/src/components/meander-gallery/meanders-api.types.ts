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
 * One group, its exact count, and the groups nested in it.
 */
export interface GalleryGroup {
  count: number;
  field: string;
  /** Absent at the deepest level the query reads. */
  groups?: GalleryGroup[];
  value: string;
}

/**
 * One meander a card shows.
 */
export type GalleryMeander = MeandersPage["edges"][number]["node"];

/**
 * One page of the meanders connection, as the API returns it.
 */
export type MeandersPage = MeandersQuery["meanders"];
