import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * One row of the `constellations` table: one of the 88 IAU constellations,
 * keyed by its three-letter designation.
 */
@Entity()
export class Constellation {
  /** The IAU designation, such as `UMa`. */
  @PrimaryColumn("text")
  designation!: string;

  /** The Latin name, such as `Ursa Major`. */
  @Column("text")
  name!: string;

  /** Whether the ecliptic crosses it as one of the twelve zodiac signs. */
  @Column("boolean")
  zodiac!: boolean;
}
