import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * One row of the `stars` table: a star of the HYG catalog the night sky draws,
 * keyed by its Hipparcos number, at J2000.
 */
@Entity()
export class Star {
  /** The B−V color index, which sets the star's color. */
  @Column("real")
  colorIndex!: number;

  /** The declination in degrees. */
  @Column("real")
  declinationDegrees!: number;

  /** The Hipparcos catalog number, which constellation lines refer to. */
  @PrimaryColumn("integer")
  hip!: number;

  /** The apparent visual magnitude. */
  @Column("real")
  magnitude!: number;

  /** The right ascension in hours. */
  @Column("real")
  rightAscensionHours!: number;
}
