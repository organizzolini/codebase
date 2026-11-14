import { ArgsType as ArgumentsType, Field, Int } from "@nestjs/graphql";

import { MeanderFilterGroupInput } from "./filters/meander-filter.entities";
import { MeanderSortInput } from "./meander-sort.entities";
import {
  DEFAULT_PAGE_SIZE,
  FILTER_ARGUMENT_DESCRIPTION,
  SORT_ARGUMENT_DESCRIPTION,
} from "./meanders.constants";

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
    defaultValue: DEFAULT_PAGE_SIZE,
    description: "How many meanders to return.",
  })
  first?: number;

  @Field(() => MeanderSortInput, {
    description: SORT_ARGUMENT_DESCRIPTION,
    nullable: true,
  })
  sort?: MeanderSortInput | null;
}
