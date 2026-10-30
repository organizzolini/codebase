import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { expect } from "vitest";

import { LoggerService } from "@codebase/observability";

import type {
  BuiltTestingModule,
  TestingModuleOptions,
} from "./testing-module.types";
import type { DeepMocked } from "@golevelup/ts-vitest";
import type { Type } from "@nestjs/common";

/**
 * Compiles a testing module around the class under test, with a logger mock,
 * a deep mock for each class in `mocks`, and the imports and providers given,
 * then resolves the class. A dependency nothing provides fails the build, so
 * resolving is itself the check that the class's wiring is complete.
 *
 * ```ts
 * const { instance, mock } = await buildTestingModule(ExportCommand, {
 *   mocks: [PostgresqlUtilitiesService],
 * });
 * mock(PostgresqlUtilitiesService).dump.mockResolvedValue(…);
 * ```
 */
export async function buildTestingModule<Target>(
  target: Type<Target>,
  options: TestingModuleOptions = {},
): Promise<BuiltTestingModule<Target>> {
  const {
    imports = [],
    mocks = [],
    providers = [],
    provideTarget = true,
  } = options;
  const logger = createMock<LoggerService>();
  const module = await Test.createTestingModule({
    imports,
    providers: [
      ...(provideTarget ? [target] : []),
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

/**
 * Builds the class under test as {@link buildTestingModule} does and asserts
 * that it set its logger's context to its own class name.
 */
export async function expectLoggerContext(
  target: Type<unknown>,
  options: TestingModuleOptions = {},
): Promise<void> {
  const { logger } = await buildTestingModule(target, options);

  expect(
    logger.setContext.mock.calls,
    `${target.name} should call setContext with its class name`,
  ).toContainEqual([target.name]);
}
