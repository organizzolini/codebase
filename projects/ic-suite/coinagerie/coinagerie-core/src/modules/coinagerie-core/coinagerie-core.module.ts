import { Module } from "@nestjs/common";

import { CoinagerieCoreService } from "./coinagerie-core.service";

/**
 * Holds no behavior: coinagerie-core is the contracts leaf, and its exports
 * are the types, constants, and errors every other coinagerie package shares.
 * The module exists so the package has the same shape as its siblings.
 */
@Module({
  controllers: [],
  exports: [CoinagerieCoreService],
  imports: [],
  providers: [CoinagerieCoreService],
})
export class CoinagerieCoreModule {}
