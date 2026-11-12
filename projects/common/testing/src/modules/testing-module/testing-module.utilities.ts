import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";

import { LoggerService } from "@codebase/observability";

import type {
  BuiltTestingModule,
  TestingModuleOptions,
} from "./testing-module.types";
import type { LoggerServiceContract } from "@codebase/observability";
import type { DeepMocked } from "@golevelup/ts-vitest";
import type { Type } from "@nestjs/common";

/**
 * Compiles a testing module around the class, with a logger mock and a deep
 * mock per `mocks` class; resolving fails on any unprovided dependency.
 */
export async function buildTestingModule<Target>(
  target: Type<Target>,
  options: TestingModuleOptions = {},
): Promise<BuiltTestingModule<Target>> {
  const { imports = [], mocks = [], providers = [] } = options;
  const logger = createMock<LoggerServiceContract>();
  const module = await Test.createTestingModule({
    imports,
    providers: [
      target,
      { provide: LoggerService, useValue: logger },
      ...mocks.map((token) => ({ provide: token, useValue: createMock() })),
      ...providers,
    ],
  }).compile();

  return {
    instance: await module.resolve(target),
    logger,
    mock: <Dependency>(token: Type<Dependency>) =>
      module.get<Dependency, DeepMocked<Dependency>>(token),
    module,
  };
}
