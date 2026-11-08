import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { NightSkyInput } from "./night-sky-input.entities";
import { NightSkyEntity } from "./night-sky.entities";
import { NightSkyService } from "./night-sky.service";

/**
 * Serves the `nightSky` query.
 */
@Resolver()
export class NightSkyResolver {
  // 🏗 Dependency Injection

  constructor(
    @Inject(NightSkyService) private readonly nightSkyService: NightSkyService,
  ) {}

  // 🔎 Queries

  /**
   * The night sky for a place and a window size.
   */
  @Query(() => NightSkyEntity, {
    description:
      "The real stars as an animated SVG, drawn about the north celestial pole for a place and a window size.",
    name: "nightSky",
  })
  public nightSky(
    @Arguments("input", { type: () => NightSkyInput }) input: NightSkyInput,
  ): NightSkyEntity {
    return this.nightSkyService.build(input);
  }

  // 🖋️ Mutations

  // 🔗 Relations
}
