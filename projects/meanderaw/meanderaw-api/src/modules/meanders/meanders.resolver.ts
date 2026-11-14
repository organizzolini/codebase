import { Inject } from "@nestjs/common";
import {
  Args as Arguments,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";

import { MeanderCharacteristicValueEntity } from "./meander-characteristic-value.entities";
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

  /** The non-zero characteristic values, read only for a meander whose query selects them. */
  @ResolveField(() => [MeanderCharacteristicValueEntity], {
    description:
      "The characteristics the meander holds, by key; a missing one reads as 0 or false.",
    name: "characteristics",
  })
  async characteristics(
    @Parent() meander: MeanderEntity,
  ): Promise<MeanderCharacteristicValueEntity[]> {
    return this.meandersService.findCharacteristics(meander);
  }

  // 🖋️ Mutations

  // 🔗 Relations

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
