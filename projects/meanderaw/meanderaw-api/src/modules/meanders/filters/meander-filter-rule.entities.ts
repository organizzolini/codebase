import { Field, InputType, registerEnumType } from "@nestjs/graphql";

// 🧬 Entities

/** What a rule compares a value with. */
export enum MeanderFilterOperator {
  BETWEEN = "between",
  EQ = "eq",
  GT = "gt",
  GTE = "gte",
  IS = "is",
  IS_NOT = "is_not",
  LT = "lt",
  LTE = "lte",
  NE = "ne",
}

registerEnumType(MeanderFilterOperator, {
  description:
    "How a rule compares: eq, ne, lt, lte, gt, gte and between for numbers, is and is_not for booleans. A missing value reads as 0 or false.",
  name: "MeanderFilterOperator",
});

/** One condition of a filter: a field, an operator and what it compares with. */
@InputType({ description: "A field, an operator and the value it compares." })
export class MeanderFilterRuleInput {
  @Field(() => String, {
    description:
      "A shape field (rows, columns, lattice, repeats, isHardcoded) or a characteristic key.",
  })
  field!: string;

  @Field(() => Boolean, {
    description: "What is and is_not compare with, for a boolean field.",
    nullable: true,
  })
  flag?: boolean | null;

  @Field(() => [Number], {
    description:
      "The number a comparison uses, or the two ends of a between, low first.",
    nullable: true,
  })
  numbers?: null | number[];

  @Field(() => MeanderFilterOperator, { description: "How to compare." })
  operator!: MeanderFilterOperator;

  @Field(() => String, {
    description: "What eq and ne compare with, for the lattice.",
    nullable: true,
  })
  text?: null | string;
}
