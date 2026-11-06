import { Field, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * The night sky as a standalone animated SVG.
 */
@ObjectType("NightSky")
export class NightSkyEntity {
  @Field(() => String, {
    description: "The star field as a standalone, animated SVG document.",
  })
  svg!: string;
}
