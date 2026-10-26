import { Column, Entity } from "typeorm";

import { SqliteDeletableEntity } from "../../src/modules/sqlite/entities/deletable.entity";

/**
 * A SQLite table for the integration suite: its own columns in camel case,
 * so the suite can see snake case applied, on every base column. Latitude
 * and longitude are `text` so a decimal survives a round trip exactly.
 */
@Entity({ name: "sprockets" })
export class Sprocket extends SqliteDeletableEntity {
  @Column({ type: "text" })
  displayName!: string;

  @Column({ nullable: true, type: "text" })
  latitude?: null | string;

  @Column({ nullable: true, type: "text" })
  longitude?: null | string;
}
