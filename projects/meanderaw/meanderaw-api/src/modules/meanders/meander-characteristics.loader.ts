import { Inject, Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";

import { MeandersService } from "./meanders.service";

import type { MeanderCharacteristicValueEntity } from "./meander-characteristic-value.entities";

/**
 * A request-scoped DataLoader of the characteristic values each meander
 * holds. Every `load` issued in the same tick shares two queries, however
 * many meanders a page holds.
 */
@Injectable({ scope: Scope.REQUEST })
export class MeanderCharacteristicsLoader {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(MeandersService)
    private readonly meandersService: MeandersService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  public readonly byMeanderId = new DataLoader<
    string,
    MeanderCharacteristicValueEntity[]
  >(async (meanderIds) =>
    this.meandersService.findCharacteristicsFor(meanderIds),
  );
}
