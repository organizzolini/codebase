import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./meanderaw-cli.constants";
import { DrawModule } from "./modules/draw/draw.module";
import { DrawingModule } from "./modules/drawing/drawing.module";
import { MatrixModule } from "./modules/matrix/matrix.module";

/**
 * Root NestJS application module.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    DiscoveryModule,
    LoggerModule,
    DrawModule,
    // 🏛️ Registered even though `DrawModule` already provides the renderer: this keeps
    // the reverse direction, parsing a finished drawing back into Codes, resolvable.
    //
    // Nothing in the draw run reads a drawing; only the historical extraction goes
    // from drawings to the Codes naming them.
    DrawingModule,
    MatrixModule,
  ],
})
export class MainModule {}
