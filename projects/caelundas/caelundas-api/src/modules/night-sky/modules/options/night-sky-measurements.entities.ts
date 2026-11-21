import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * What building a night sky measured, for the tuning view.
 */
@ObjectType("NightSkyMeasurements")
export class NightSkyMeasurementsEntity {
  @Field(() => Float)
  bottomAltitudeDegrees!: number;

  @Field(() => Boolean, {
    description:
      "Whether the field of view was cut to keep the pole off screen.",
  })
  fieldOfViewClamped!: boolean;

  @Field(() => Float)
  fieldOfViewLimitDegrees!: number;

  @Field(() => Float, {
    description: "Seconds for one full turn at the requested drift speed.",
  })
  periodSeconds!: number;

  @Field(() => Float, {
    description:
      "Pixels from the top edge up to the pole, the rotation center.",
  })
  poleDistanceAboveScreen!: number;

  @Field(() => Float, {
    description: "How many times faster than the real sky the backdrop turns.",
  })
  realTimeMultiple!: number;

  @Field(() => Int, { description: "Figure segments with any part drawn." })
  segmentsDrawn!: number;

  @Field(() => Int)
  starsDrawn!: number;

  @Field(() => Int)
  starsInCatalog!: number;

  @Field(() => Int)
  svgLength!: number;

  @Field(() => Float)
  topAltitudeDegrees!: number;

  @Field(() => Float)
  verticalFieldOfViewDegrees!: number;
}
