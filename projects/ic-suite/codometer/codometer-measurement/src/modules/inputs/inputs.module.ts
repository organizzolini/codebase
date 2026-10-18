import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { InputsService } from "./inputs.service";

/**
 * NestJS module that lists the files each declared input holds.
 */
@Module({
  controllers: [],
  exports: [InputsService],
  imports: [LoggerModule],
  providers: [InputsService],
})
export class InputsModule {}
