import { Inject } from "@nestjs/common";
import {
  Args as Arguments,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";

import { MeanderConnection } from "./meander-connection.entities";
import { MeanderSortInput } from "./meander-sort.entities";
import {
  DEFAULT_PAGE_SIZE,
  MEANDERS_QUERY_DESCRIPTION,
  SORT_ARGUMENT_DESCRIPTION,
} from "./meanders.constants";
import { MeanderEntity } from "./meanders.entities";
import { MeandersService } from "./meanders.service";

/** Serves the meanders over the Meanderaw Postgres. */
@Resolver(() => MeanderEntity)
export class MeandersResolver {
  // 🏗 Dependency Injection

  constructor(
    @Inject(MeandersService)
    private readonly meandersService: MeandersService,
  ) {}

  // 🔎 Queries

  /** A page of meanders. */
  @Query(() => MeanderConnection, {
    description: MEANDERS_QUERY_DESCRIPTION,
    name: "meanders",
  })
  async meanders(
    @Arguments("sort", {
      description: SORT_ARGUMENT_DESCRIPTION,
      nullable: true,
      type: () => MeanderSortInput,
    })
    sort?: MeanderSortInput | null,
    @Arguments("first", {
      defaultValue: DEFAULT_PAGE_SIZE,
      description: "How many meanders to return.",
      type: () => Int,
    })
    first?: number,
    @Arguments("after", {
      description: "The cursor of the last meander already seen.",
      nullable: true,
      type: () => String,
    })
    after?: null | string,
  ): Promise<MeanderConnection> {
    return this.meandersService.find({ after, first, sort });
  }

  // 🖋️ Mutations

  // 🔗 Relations

  /** The drawing, rendered only for a meander whose query selects it. */
  @ResolveField(() => String, {
    description:
      "The meander's drawing as an SVG document, rendered on request from its Code.",
    name: "svg",
  })
  svg(@Parent() meander: MeanderEntity): string {
    return this.meandersService.draw(meander);
  }
}
