import { Module } from "@nestjs/common";

import { SampleClockModule } from "./sample-clock.module";
import { SampleGreeterService } from "./sample-greeter.service";

/** A module whose wiring the module-wiring assertions read. */
@Module({
  exports: [SampleGreeterService],
  imports: [SampleClockModule],
  providers: [SampleGreeterService],
})
export class SampleGreeterModule {}
