import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { MeanderGroupsArguments } from "./meander-groups-arguments.entities";
import { MEANDER_GROUPS_QUERY_DESCRIPTION } from "./meander-groups.constants";
import { MeanderGroupEntity } from "./meander-groups.entities";
import { MeanderGroupsService } from "./meander-groups.service";

/** Serves the exact counts of the meanders, grouped. */
@Resolver(() => MeanderGroupEntity)
export class MeanderGroupsResolver {
  // 🏗 Dependency Injection

  constructor(
    @Inject(MeanderGroupsService)
    private readonly meanderGroupsService: MeanderGroupsService,
  ) {}

  // 🔎 Queries

  /** The groups of a filter's meanders, nested by level. */
  @Query(() => [MeanderGroupEntity], {
    description: MEANDER_GROUPS_QUERY_DESCRIPTION,
    name: "meanderGroups",
  })
  async meanderGroups(
    @Arguments() arguments_: MeanderGroupsArguments,
  ): Promise<MeanderGroupEntity[]> {
    return this.meanderGroupsService.group(arguments_);
  }

  // 🖋️ Mutations

  // 🔗 Relations
}
