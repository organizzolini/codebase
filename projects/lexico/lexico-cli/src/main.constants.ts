// ♟️ Constants

import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/logging";

import { environmentSchema } from "./lexico-cli.constants";
import { ExportModule } from "./modules/export/export.module";
import { ImportModule } from "./modules/import/import.module";

/**
 * What every root module holds: validated configuration, discovery, the
 * logger, and the commands that name their database by URI.
 */
export const ROOT_IMPORTS = [
  ConfigModule.forRoot({
    envFilePath: ".env",
    isGlobal: true,
    validate: (config: Record<string, unknown>) =>
      environmentSchema.parse(config),
  }),
  DiscoveryModule,
  LoggerModule,
  ExportModule,
  ImportModule,
];

/**
 * Commands that name their database by URI and so boot on
 * `StandaloneModule`, without the Lexico database connection.
 */
export const STANDALONE_COMMANDS: readonly string[] = ["export", "import"];
