import { Field, Float, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/** One characteristic a meander holds, with the value it holds. */
@ObjectType({
  description: "A characteristic a meander holds at a non-zero value.",
})
export class MeanderCharacteristicValueEntity {
  @Field(() => Boolean, { description: "Whether it names a kind of meander." })
  isPattern!: boolean;

  @Field(() => String, { description: "The catalog key." })
  key!: string;

  @Field(() => String, { description: "Its display name." })
  name!: string;

  @Field(() => Float, { description: "The stored value; 1 stands for true." })
  value!: number;
}
