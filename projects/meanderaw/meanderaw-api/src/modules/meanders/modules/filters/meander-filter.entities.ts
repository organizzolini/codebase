import { Field, InputType, registerEnumType } from "@nestjs/graphql";

import { MeanderFilterRuleInput } from "./meander-filter-rule.entities";

// 🧬 Entities

/** How a group joins the rules and groups in it. */
export enum MeanderFilterCombinator {
  AND = "and",
  OR = "or",
}

registerEnumType(MeanderFilterCombinator, {
  description: "How a filter group joins the rules and groups in it.",
  name: "MeanderFilterCombinator",
});

/** Rules and nested groups joined under one combinator. */
@InputType({ description: "Rules and nested groups under one combinator." })
export class MeanderFilterGroupInput {
  @Field(() => MeanderFilterCombinator, {
    description: "How the rules and groups are joined.",
  })
  combinator!: MeanderFilterCombinator;

  @Field(() => [MeanderFilterGroupInput], {
    description: "The groups nested in this one.",
    nullable: true,
  })
  groups?: MeanderFilterGroupInput[] | null;

  @Field(() => [MeanderFilterRuleInput], {
    description: "The rules of this group.",
    nullable: true,
  })
  rules?: MeanderFilterRuleInput[] | null;
}
