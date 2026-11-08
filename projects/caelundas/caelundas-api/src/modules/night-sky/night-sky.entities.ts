import { Field, ObjectType } from "@nestjs/graphql";

import { NightSkyMeasurementsEntity } from "./night-sky-measurements.entities";

// 🧬 Entities

/**
 * The night sky as a standalone animated SVG.
 */
@ObjectType("NightSky")
export class NightSkyEntity {
  @Field(() => NightSkyMeasurementsEntity, {
    description:
      "What the build measured. Only the tuning view needs it: ask for it and it is returned, leave it out and it is not.",
  })
  measurements!: NightSkyMeasurementsEntity;

  @Field(() => String, {
    description: "The star field as a standalone, animated SVG document.",
  })
  svg!: string;
}
