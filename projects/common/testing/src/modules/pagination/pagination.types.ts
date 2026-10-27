/** How a matrix is built: its cursor encoding, and whether to keep it quick. */
export interface MatrixOptions {
  /** Encodes the cursor a connection hands out for an id; `{ id }` by default. */
  readonly cursorOf?: (id: string) => string;
  /** Keeps only the middle member, the outsider, and one pair. */
  readonly quick?: boolean;
}

/** Plain Relay arguments, so matrix entries can be spread and combined. */
export interface PageRequest {
  readonly after?: string;
  readonly before?: string;
  readonly first?: number;
  readonly last?: number;
}

/** The observable shape of one Relay page, independent of entity hydration. */
export interface PageSummary {
  readonly endCursor: string | undefined;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly ids: readonly string[];
  readonly startCursor: string | undefined;
  readonly totalCount: number;
}

/**
 * Parameters for finding index bounds for array pagination.
 */
export interface PaginationBoundsParameters<T> {
  after?: null | string | undefined;
  before?: null | string | undefined;
  getCursor: (item: T) => string;
}
