import { Field, InputType, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * One condition of a filter: a field, an operator and the values it compares
 * with. A rule that is not finished, with no known operator or no usable
 * values, is left out of the filter rather than failing it.
 */
@InputType("EventFilterRuleInput")
@ObjectType("EventFilterRule")
export class EventFilterRuleEntity {
  @Field(() => Boolean, {
    description: "Keeps the events the condition does not hold for instead.",
    nullable: true,
  })
  negated?: boolean | null;

  @Field(() => String, {
    description:
      "The operator, such as is_any_of, has_all_of, is_none_of, between, not_between, contains, not_contains, eq, neq, gt, gte, lt or lte.",
  })
  operator!: string;

  @Field(() => [String], {
    description:
      "The field's id as its path: tag:<root tag id> for a tag root, or date, weekday, hour, duration, duration-minutes, temporality or text.",
  })
  path!: string[];

  @Field(() => [String], {
    description:
      "What the rule compares with: the tag ids or bucket names to pick from, the two ends of a range, or the one number or text, each written as text.",
    nullable: true,
  })
  values?: null | string[];
}
