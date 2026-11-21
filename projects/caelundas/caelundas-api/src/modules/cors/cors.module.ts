import { Module } from "@nestjs/common";

import { CorsService } from "./cors.service";

/**
 * Owns the CORS options the bootstrap enables for browser clients.
 */
@Module({
  controllers: [],
  exports: [CorsService],
  imports: [],
  providers: [CorsService],
})
export class CorsModule {}
