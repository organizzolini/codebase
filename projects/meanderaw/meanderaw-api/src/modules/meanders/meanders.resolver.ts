import { Inject } from "@nestjs/common";
import {
  Args as Arguments,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";

import { MeanderConnection } from "./meander-connection.entities";
import { MeandersArgs as MeandersArguments } from "./meanders-arguments.entities";
import { MEANDERS_QUERY_DESCRIPTION } from "./meanders.constants";
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
    @Arguments() arguments_: MeandersArguments,
  ): Promise<MeanderConnection> {
    const { after, filter, first, sort } = arguments_;

    return this.meandersService.find({ after, filter, first, sort });
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
