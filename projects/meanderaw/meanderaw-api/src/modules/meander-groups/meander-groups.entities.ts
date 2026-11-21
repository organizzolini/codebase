import { Field, Int, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/** One group: its key at one level, its count, and the groups nested in it. */
@ObjectType({ description: "A group of meanders and its exact count." })
export class MeanderGroupEntity {
  @Field(() => Int, { description: "How many meanders the group holds." })
  count!: number;

  @Field(() => String, { description: "The level this group is a key of." })
  field!: string;

  @Field(() => [MeanderGroupEntity], {
    description: "The groups of the next level, empty at the last.",
  })
  groups!: MeanderGroupEntity[];

  @Field(() => String, {
    description:
      "The key: a number, true or false, a lattice, or rows and columns as RxC.",
  })
  value!: string;
}
