import { Field, Int, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * The span the whole dataset covers and the zone its events were computed
 * in.
 */
@ObjectType("EventsDataset")
export class EventsDatasetEntity {
  @Field(() => Int, { description: "How many events the dataset holds." })
  count!: number;

  @Field(() => Date, {
    description: "The end of the latest event, as an instant.",
  })
  end!: Date | string;

  @Field(() => Date, {
    description: "The start of the earliest event, as an instant.",
  })
  start!: Date | string;

  @Field(() => String, {
    description:
      "The IANA zone most events were computed in, for rendering local time.",
  })
  timezone!: string;
}
