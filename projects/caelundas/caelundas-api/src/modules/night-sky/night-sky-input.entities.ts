import { Field, Float, InputType, Int } from "@nestjs/graphql";

// 📥 Inputs

/**
 * Every option the night sky builder takes. Anything left out takes the
 * builder's default.
 */
@InputType()
export class NightSkyInput {
  @Field(() => String, {
    description: "Hexadecimal color at the bottom of the background.",
    nullable: true,
  })
  backgroundBottomColor?: string;

  @Field(() => String, {
    description: "Hexadecimal color at the top of the background.",
    nullable: true,
  })
  backgroundTopColor?: string;

  @Field(() => Float, {
    description: "Altitude at the bottom edge, from -45 to 89. Defaults to 0.",
    nullable: true,
  })
  bottomAltitudeDegrees?: number;

  @Field(() => [String], {
    description:
      "Figures to draw: constellation names such as ursa_major, or all, zodiac or none. Defaults to the zodiac.",
    nullable: true,
  })
  constellations?: string[];

  @Field(() => Boolean, {
    description: "Draws the zoomed-out tuning view instead of the backdrop.",
    nullable: true,
  })
  debug?: boolean;

  @Field(() => Boolean, {
    description: "Draws the ecliptic, the Sun's path. Defaults to true.",
    nullable: true,
  })
  ecliptic?: boolean;

  @Field(() => String, {
    description: "Hexadecimal color of the ecliptic.",
    nullable: true,
  })
  eclipticColor?: string;

  @Field(() => Float, {
    description: "Opacity of the ecliptic, from 0 to 1. Defaults to 0.12.",
    nullable: true,
  })
  eclipticOpacity?: number;

  @Field(() => Float, {
    description:
      "Width of the ecliptic in pixels, from 0 to 10. Defaults to 1.",
    nullable: true,
  })
  eclipticWidth?: number;

  @Field(() => Float, {
    description: "Faintest star drawn, from -2 to 12. Defaults to 6.5.",
    nullable: true,
  })
  faintestMagnitude?: number;

  @Field(() => Int, { description: "Pixel height of the area the SVG fills." })
  height!: number;

  @Field(() => Float, {
    description:
      "Observer latitude above 0 and up to 90, north positive. Defaults to 90.",
    nullable: true,
  })
  latitudeDegrees?: number;

  @Field(() => String, {
    description: "Hexadecimal color of the figures.",
    nullable: true,
  })
  lineColor?: string;

  @Field(() => Float, {
    description: "Opacity of the figures, from 0 to 1. Defaults to 0.24.",
    nullable: true,
  })
  lineOpacity?: number;

  @Field(() => Float, {
    description:
      "Width of the figures in pixels, from 0 to 10. Defaults to 0.8.",
    nullable: true,
  })
  lineWidth?: number;

  @Field(() => Float, {
    description:
      "Observer longitude, east positive, from -360 to 360. Defaults to -74.",
    nullable: true,
  })
  longitudeDegrees?: number;

  @Field(() => Float, {
    description:
      "On-screen drift speed at the window center, up to 1000. Defaults to 3.",
    nullable: true,
  })
  pixelsPerSecond?: number;

  @Field(() => Float, {
    description: "Multiplier on dot size, up to 10. Defaults to 1.",
    nullable: true,
  })
  starScale?: number;

  @Field(() => Boolean, {
    description:
      "Draws the sky at its starting angle with no animation, for reduced motion.",
    nullable: true,
  })
  still?: boolean;

  @Field(() => Date, {
    description:
      "The moment the sky is drawn for, which sets its starting angle with the longitude. Defaults to now.",
    nullable: true,
  })
  time?: Date;

  @Field(() => Float, {
    description: "Degrees of altitude shown, up to 90. Defaults to 90.",
    nullable: true,
  })
  verticalFieldOfViewDegrees?: number;

  @Field(() => Int, { description: "Pixel width of the area the SVG fills." })
  width!: number;
}
