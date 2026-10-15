import { Module } from "@nestjs/common";

import { ROOT_IMPORTS } from "./main.constants";

/**
 * The root for commands that name their database by URI, such as `export`.
 * It leaves out the ingestion commands and with them the Lexico database
 * connection, which would otherwise open at start-up, before any option is
 * validated, against a database those commands never use.
 */
@Module({
  imports: ROOT_IMPORTS,
})
export class StandaloneModule {}
