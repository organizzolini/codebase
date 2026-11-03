import { Module } from "@nestjs/common";

import { SampleClockService } from "./sample-clock.service";

/** The module the greeter module imports its clock from. */
@Module({ exports: [SampleClockService], providers: [SampleClockService] })
export class SampleClockModule {}
