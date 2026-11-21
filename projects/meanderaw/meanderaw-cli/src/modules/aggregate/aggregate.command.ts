import { Inject, Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { MeanderawDatabaseAggregatesService } from "@codebase/meanderaw-db";
import { LoggerService } from "@codebase/observability";

/**
 * Rebuilds the aggregate count tables, and each characteristic's
 * `meanderCount`, from the meanders already in the database. The draw run
 * calls it last; run it alone after a `--code` drawing.
 */
@Command({
  description:
    "Rebuild the exact count tables, and each characteristic's meander count, from the meanders in the database, swapping them in within one transaction",
  name: "aggregate",
})
@Injectable()
export class AggregateCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    @Inject(MeanderawDatabaseAggregatesService)
    private readonly aggregatesService: MeanderawDatabaseAggregatesService,
  ) {
    super();
    this.logger.setContext(AggregateCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Rebuilds every count table in one transaction. */
  async run(): Promise<void> {
    await this.aggregatesService.rebuild();

    this.logger.log("✨ Rebuilt the aggregate counts");
  }
}
