import { ArgsType as ArgumentsType, Field } from "@nestjs/graphql";

import { MeanderFilterGroupInput } from "../meanders/modules/filters/meander-filter.entities";

import { MeanderGroupLevelInput } from "./meander-group-level.entities";
import { GROUP_BY_ARGUMENT_DESCRIPTION } from "./meander-groups.constants";

/** What a `meanderGroups` query asks for. */
@ArgumentsType()
export class MeanderGroupsArguments {
  @Field(() => MeanderFilterGroupInput, {
    description: "The meanders to group, as in `meanders`; all when left out.",
    nullable: true,
  })
  filter?: MeanderFilterGroupInput | null;

  @Field(() => [MeanderGroupLevelInput], {
    description: GROUP_BY_ARGUMENT_DESCRIPTION,
  })
  groupBy!: MeanderGroupLevelInput[];
}
