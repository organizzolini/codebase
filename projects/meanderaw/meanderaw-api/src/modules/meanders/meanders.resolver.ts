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
import { MeandersArgs as MeandersArguments } from "./meanders-arguments.entities";
import {
  DEFAULT_SVG_REPEATS,
  MEANDERS_QUERY_DESCRIPTION,
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
    @Arguments() arguments_: MeandersArguments,
  ): Promise<MeanderConnection> {
    const { after, filter, first, offset, sort } = arguments_;

    return this.meandersService.find({
      after,
      filter,
      first,
      offset,
      sort,
    });
  }

  // 🖋️ Mutations

  // 🔗 Relations

  /** The drawing, rendered only for a meander whose query selects it. */
  @ResolveField(() => String, {
    description:
      "The meander's drawing as an SVG document, rendered on request from its Code, its tile repeated `repeats` times across (1 to 24).",
    name: "svg",
  })
  svg(
    @Parent() meander: MeanderEntity,
    @Arguments("repeats", {
      defaultValue: DEFAULT_SVG_REPEATS,
      description: "How many times the tile repeats across, from 1 to 24.",
      type: () => Int,
    })
    repeats: number,
  ): string {
    return this.meandersService.draw(meander, repeats);
  }
}
