import { Module } from "@nestjs/common";

import { InputOptionsService } from "./input-options.service";
import { InputPromptingService } from "./input-prompting.service";
import { InputSchemaService } from "./input-schema.service";
import { InputService } from "./input.service";

/**
 * Owns command-line argument parsing and interactive input resolution.
 *
 * `InputOptionsService` is exported for non-interactive hosts, which need
 * option normalization without prompting. `InputPromptingService` is exported
 * for commands that decide whether to ask, and need the picker without input
 * resolution.
 */
@Module({
  controllers: [],
  exports: [InputOptionsService, InputPromptingService, InputService],
  imports: [],
  providers: [
    InputOptionsService,
    InputPromptingService,
    InputSchemaService,
    InputService,
  ],
})
export class InputModule {}
