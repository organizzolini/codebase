import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import type { DynamicModule, Type } from "@nestjs/common";

/**
 * Root module for a package that bootstraps nothing of its own.
 *
 * Stands in as a `MainModule` to explore from, importing every module the package defines. The global `ConfigModule` comes along, since a `useFactory` reading configuration cannot scan without it.
 */
@Module({})
export class SyntheticRootModule {
  /** Roots a graph in the given modules. */
  static forModules(moduleClasses: Type<unknown>[]): DynamicModule {
    return {
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
        ...moduleClasses,
      ],
      module: SyntheticRootModule,
    };
  }
}
