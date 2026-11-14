import { Column, Entity, PrimaryColumn } from "typeorm";

import { BIGINT_NUMBER_TRANSFORMER } from "../meanderaw-database.constants";

/**
 * The one row that says the aggregate tables count the meanders as they stand:
 * the rebuild writes it, and every write to the meanders or the catalog
 * deletes it. A reader answers from the tables only while it exists.
 */
@Entity({ name: "aggregate_markers" })
export class AggregateMarker {
  @PrimaryColumn({
    primaryKeyConstraintName: "PK_aggregate_markers",
    type: "smallint",
  })
  id!: number;

  @Column({ transformer: BIGINT_NUMBER_TRANSFORMER, type: "bigint" })
  meanderCount!: number;
}
