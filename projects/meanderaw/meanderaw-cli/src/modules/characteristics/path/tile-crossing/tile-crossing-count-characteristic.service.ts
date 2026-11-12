import { Inject, Injectable } from "@nestjs/common";

import { ConnectivityService } from "../../connectivity/connectivity.service";

import type {
  CharacteristicContext,
  CharacteristicEvaluator,
  CharacteristicMetadata,
} from "../../characteristics.types";

/**
 * Counts the edges crossing the tile boundary: eastward edges off the last column that
 * exist only because the Code repeats. It is the difference between the cyclic-band and
 * lone-tile reads. Replaces the `crossesTheSeam` flag.
 */
@Injectable()
export class TileCrossingCountCharacteristicService implements CharacteristicEvaluator<number> {
  // 🏗 Dependency Injection

  constructor(
    @Inject(ConnectivityService)
    private readonly connectivityService: ConnectivityService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** Names and explains `tileCrossingCount` for catalogs and inspectors. */
  public readonly metadata: CharacteristicMetadata<number> = {
    category: "path",
    description:
      "The number of edges that cross the tile boundary — the join where the tile's last column meets its first when the Code is read as a repeating band. Nonzero exactly when the ink crosses the tile boundary at all.",
    formula: String.raw`|E_{\text{band}}| - |E_{\text{tile}}|`,
    key: "tileCrossingCount",
    name: "Tile Crossing Count",
    valueType: "number",
  };

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Counts the edges the band holds that the lone tile does not. */
  public compute(context: CharacteristicContext): number {
    const { matrix } = context;

    return (
      this.connectivityService.edges(matrix, false).length -
      this.connectivityService.edges(matrix, true).length
    );
  }
}
