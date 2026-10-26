import "reflect-metadata";
import { repl } from "@nestjs/core";

import { MainModule } from "./coinagerie-cli.module";

/**
 * Opens an interactive NestJS repl over the root module.
 */
async function bootstrap(): Promise<void> {
  await repl(MainModule);
}

void bootstrap();
