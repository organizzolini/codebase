import { Module } from "@nestjs/common";

import { InputService } from "./input.service";

/**
 * Module for environment validation and domain input parsing. Exports {@link InputService}, which turns the validated environment ({@link Env}) into a timezone-aware {@link Input}. Depends on `ConfigModule` being global, registered in {@link AppModule}.
 */
@Module({
  controllers: [],
  exports: [InputService],
  imports: [],
  providers: [InputService],
})
export class InputModule {}
