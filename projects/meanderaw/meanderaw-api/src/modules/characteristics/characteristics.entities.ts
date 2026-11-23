import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

import { CharacteristicValueCountEntity } from "./characteristic-value-count.entities";

// 🧬 Entities

/** One characteristic of the catalog, with its stored value counts. */
@ObjectType({ description: "A characteristic the draw run measures." })
export class CharacteristicEntity {
  @Field(() => String, {
    description: "Where it is measured: submatrix, path, or compound.",
  })
  category!: string;

  @Field(() => String, { description: "What it measures." })
  description!: string;

  @Field(() => String, {
    description: "Where it is documented.",
    nullable: true,
  })
  documentationUrl!: null | string;

  @Field(() => String, { description: "How it is computed.", nullable: true })
  formula!: null | string;

  @Field(() => Int, { description: "The catalog id." })
  id!: number;

  @Field(() => Boolean, { description: "Whether it names a kind of meander." })
  isPattern!: boolean;

  @Field(() => String, {
    description: "The name an evaluator registers it under.",
  })
  key!: string;

  @Field(() => Float, { description: "How many meanders hold it." })
  meanderCount!: number;

  @Field(() => String, { description: "Its display name." })
  name!: string;

  @Field(() => [CharacteristicValueCountEntity], {
    description:
      "How many meanders hold each stored value, where counts exist.",
  })
  valueCounts!: CharacteristicValueCountEntity[];

  @Field(() => String, { description: "number or boolean." })
  valueType!: string;
}
