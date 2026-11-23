import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { SynchronizationMarkersService } from "./synchronization-markers.service";
import { SynchronizationCommand } from "./synchronization.command";
import { SYNCHRONIZABLE_COMMANDS } from "./synchronization.constants";
import { SynchronizationService } from "./synchronization.service";

import type { SynchronizableCommand } from "./synchronization.types";

/**
 * Owns the contract every check and derivation shares, and the `start`
 * aggregate. To add a command to the aggregate, import its module and list it
 * in the `SYNCHRONIZABLE_COMMANDS` factory's `inject`.
 */
@Module({
  controllers: [],
  exports: [
    SynchronizationCommand,
    SynchronizationMarkersService,
    SynchronizationService,
  ],
  imports: [LoggerModule],
  providers: [
    SynchronizationCommand,
    SynchronizationMarkersService,
    SynchronizationService,
    {
      inject: [],
      provide: SYNCHRONIZABLE_COMMANDS,
      useFactory: (): SynchronizableCommand[] => [],
    },
  ],
})
export class SynchronizationModule {}
