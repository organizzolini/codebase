import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FixtureDatabaseModule } from "./fixture-persistence.module";
import { SampleWidgetsService } from "./sample-widgets.service";
import { Widget } from "./widget.entity";

/** A feature module that imports the project's own database module. */
@Module({
  exports: [SampleWidgetsService],
  imports: [FixtureDatabaseModule, TypeOrmModule.forFeature([Widget])],
  providers: [SampleWidgetsService],
})
export class SampleWidgetsModule {}
