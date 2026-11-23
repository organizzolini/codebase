import { Inject } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { CHARACTERISTICS_QUERY_DESCRIPTION } from "./characteristics.constants";
import { CharacteristicEntity } from "./characteristics.entities";
import { CharacteristicsService } from "./characteristics.service";

/** Serves the characteristic catalog. */
@Resolver(() => CharacteristicEntity)
export class CharacteristicsResolver {
  // 🏗 Dependency Injection

  constructor(
    @Inject(CharacteristicsService)
    private readonly characteristicsService: CharacteristicsService,
  ) {}

  // 🔎 Queries

  /** The catalog, by key. */
  @Query(() => [CharacteristicEntity], {
    description: CHARACTERISTICS_QUERY_DESCRIPTION,
    name: "characteristics",
  })
  async characteristics(): Promise<CharacteristicEntity[]> {
    return this.characteristicsService.findAll();
  }

  // 🖋️ Mutations

  // 🔗 Relations
}
