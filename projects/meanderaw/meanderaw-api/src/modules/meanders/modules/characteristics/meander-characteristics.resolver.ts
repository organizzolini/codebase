import { Inject } from "@nestjs/common";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { MeanderEntity } from "../../meanders.entities";

import { MeanderCharacteristicValueEntity } from "./meander-characteristic-value.entities";
import { MeanderCharacteristicsLoader } from "./meander-characteristics.loader";

/** Resolves the characteristic values a meander holds. */
@Resolver(() => MeanderEntity)
export class MeanderCharacteristicsResolver {
  // 🏗 Dependency Injection

  constructor(
    @Inject(MeanderCharacteristicsLoader)
    private readonly loader: MeanderCharacteristicsLoader,
  ) {}

  // 🔎 Queries

  // 🖋️ Mutations

  // 🔗 Relations

  /** The non-zero values, read only for a meander whose query selects them. */
  @ResolveField(() => [MeanderCharacteristicValueEntity], {
    description:
      "The characteristics the meander holds, by key; a missing one reads as 0 or false.",
    name: "characteristics",
  })
  async characteristics(
    @Parent() meander: MeanderEntity,
  ): Promise<MeanderCharacteristicValueEntity[]> {
    return this.loader.byMeanderId.load(meander.id);
  }
}
