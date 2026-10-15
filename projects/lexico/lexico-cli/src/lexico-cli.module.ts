import { Module } from "@nestjs/common";

import { ROOT_IMPORTS } from "./main.constants";
import { LexicoIngestionModule } from "./modules/lexico-ingestion/lexico-ingestion.module";

/**
 * Root NestJS application module.
 */
@Module({
  imports: [...ROOT_IMPORTS, LexicoIngestionModule],
})
export class MainModule {}
