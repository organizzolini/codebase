import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/** One meander, addressed by its Code. */
@ObjectType({ description: "A meander, addressed by its Code." })
export class MeanderEntity {
  @Field(() => String, { description: "The meander's Code." })
  code!: string;

  @Field(() => Int, { description: "How many columns one repeat spans." })
  columns!: number;

  @Field(() => ID, { description: "The meander's id." })
  id!: string;

  @Field(() => Boolean, {
    description: "Whether it came from the historical corpus.",
  })
  isHardcoded!: boolean;

  @Field(() => String, { description: "Which lattice it sits on." })
  lattice!: string;

  @Field(() => Int, { description: "How many times its unit repeats." })
  repeats!: number;

  @Field(() => Int, { description: "How many rows deep it is." })
  rows!: number;

  @Field(() => [String], {
    description: "Sorted Codes of the symmetry class's other members.",
  })
  symmetricalCodes!: string[];
}
