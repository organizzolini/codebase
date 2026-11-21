import { ArgsType as ArgumentsType, Field, Int } from "@nestjs/graphql";

import {
  FILTER_ARGUMENT_DESCRIPTION,
  SORT_ARGUMENT_DESCRIPTION,
} from "./meanders.constants";
import { MeanderFilterGroupInput } from "./modules/filters/meander-filter.entities";
import { MeanderSortInput } from "./modules/sorting/meander-sort.entities";

/** What a `meanders` query asks for. */
@ArgumentsType()
export class MeandersArgs {
  @Field(() => String, {
    description: "The cursor of the last meander already seen.",
    nullable: true,
  })
  after?: null | string;

  @Field(() => MeanderFilterGroupInput, {
    description: FILTER_ARGUMENT_DESCRIPTION,
    nullable: true,
  })
  filter?: MeanderFilterGroupInput | null;

  @Field(() => Int, {
    description: "How many meanders to return; 50 when left out, at most 200.",
    nullable: true,
  })
  first?: number;

  @Field(() => Int, {
    description:
      "How many meanders to skip first, after the cursor if there is one; to jump to a page.",
    nullable: true,
  })
  offset?: number;

  @Field(() => [MeanderSortInput], {
    description: SORT_ARGUMENT_DESCRIPTION,
    nullable: true,
  })
  sort?: MeanderSortInput[] | null;
}
