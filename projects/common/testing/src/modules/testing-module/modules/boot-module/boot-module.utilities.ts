import { Test } from "@nestjs/testing";
import { onTestFinished } from "vitest";

import type { DynamicModule, Type } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";

/** Boots a root module with its real providers, closing it once the running test finishes. */
export async function bootModule(
  module: DynamicModule | Type<unknown>,
): Promise<TestingModule> {
  const compiled = await Test.createTestingModule({
    imports: [module],
  }).compile();

  onTestFinished(async () => {
    await compiled.close();
  });

  return compiled;
}
