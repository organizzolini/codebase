import { Field, InputType } from "@nestjs/graphql";

// 📥 Inputs

/**
 * A half-open span of time: `start` is included and `end` is not.
 */
@InputType("EventsWindowInput")
export class EventsWindowInput {
  @Field(() => Date, {
    description: "The moment the window stops at, which it does not include.",
  })
  end!: Date | string;

  @Field(() => Date, { description: "The first moment the window includes." })
  start!: Date | string;
}
