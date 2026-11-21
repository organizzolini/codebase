import { Field, InputType } from "@nestjs/graphql";

import { SortDirection } from "./sort-direction.entities";

/** What to sort meanders by, and which way. */
@InputType({ description: "A field to sort by and a direction." })
export class MeanderSortInput {
  @Field(() => SortDirection, {
    defaultValue: SortDirection.ASC,
    description: "Which way to sort.",
  })
  direction!: SortDirection;

  @Field(() => String, {
    description: "A shape field or a characteristic key.",
  })
  field!: string;
}
