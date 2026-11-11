import { Inject, Injectable } from "@nestjs/common";

import { ConnectivityService } from "../../connectivity/connectivity.service";

import type {
  CharacteristicContext,
  CharacteristicEvaluator,
  CharacteristicMetadata,
} from "../../characteristics.types";

/**
 * Counts the connected components of one repeat, the zeroth Betti number $b_0$, walking the
 * Code as a graph over the cyclic band. Every point is a vertex, so an isolated dot counts as one.
 */
@Injectable()
export class BettiNumber0CountCharacteristicService implements CharacteristicEvaluator<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(ConnectivityService)
    private readonly connectivityService: ConnectivityService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** Names and explains `bettiNumber0Count` for catalogs and inspectors. */
  public readonly metadata: CharacteristicMetadata<number> = {
    category: "path",
    description:
      "The zeroth Betti number of one repeat's ink read as a graph over the cyclic band: how many connected components it falls into, each isolated dot counting as a component of its own.",
    formula: String.raw`b_0 = \left|\text{components}(G)\right|`,
    key: "bettiNumber0Count",
    name: "Betti Number 0 Count",
    valueType: "number",
  };

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Counts the components of the wrapped repeat graph. */
  public compute(context: CharacteristicContext): number {
    return this.connectivityService.connectivity(context.matrix).components;
  }
}
