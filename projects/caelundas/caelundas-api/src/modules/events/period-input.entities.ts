import { Field, InputType } from "@nestjs/graphql";

// 📥 Inputs

/**
 * A half-open span of time: `start` is included and `end` is not.
 */
@InputType("PeriodInput")
export class PeriodInput {
  @Field(() => Date, {
    description: "The moment the period stops at, which it does not include.",
  })
  end!: Date | string;

  @Field(() => Date, { description: "The first moment the period includes." })
  start!: Date | string;
}
