import { expect } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import type { TestingModuleOptions } from "@codebase/testing/nestjs";
import type { Type } from "@nestjs/common";

/**
 * Builds the class under test with `buildTestingModule` from
 * `@codebase/testing/nestjs` and asserts that it set its logger's context to
 * its own class name.
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
