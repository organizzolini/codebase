import type { LoggerService } from "@codebase/observability";
import type { DeepMocked } from "@golevelup/ts-vitest";
import type { ModuleMetadata, Provider, Type } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";

/**
 * A compiled testing module and the class under test, resolved from it.
 */
export interface BuiltTestingModule<Target> {
  /** The class under test, resolved with its dependencies injected. */
  readonly instance: Target;

  /** The logger mock injected in place of the real logger. */
  readonly logger: DeepMocked<LoggerService>;

  /** A mock the module was built with, typed for staging and asserting. */
  readonly mock: <Dependency>(
    token: Type<Dependency>,
  ) => DeepMocked<Dependency>;

  /** The compiled testing module, for resolving anything else. */
  readonly module: TestingModule;
}

/**
 * What to build a testing module with, besides the class under test and the
 * logger mock it always gets.
 */
export interface TestingModuleOptions {
  /** Modules to import, for real dependencies they provide. */
  readonly imports?: ModuleMetadata["imports"];

  /** Classes each provided as a deep mock in place of the real one. */
  readonly mocks?: readonly Type<unknown>[];

  /** Further providers, such as real dependencies or hand-made values. */
  readonly providers?: readonly Provider[];
}
