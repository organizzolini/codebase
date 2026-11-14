import { Field, Float, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/** How many meanders hold one characteristic at one value. */
@ObjectType({
  description: "How many meanders hold a characteristic at a value.",
})
export class CharacteristicValueCountEntity {
  @Field(() => Float, {
    description: "How many meanders hold exactly this value.",
  })
  meanderCount!: number;

  @Field(() => Float, { description: "The stored value; 1 stands for true." })
  value!: number;
}
