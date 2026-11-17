import { MODULE_METADATA } from "@nestjs/common/constants";
import { expect } from "vitest";

import type { Type } from "@nestjs/common";

/**
 * Asserts that a module's `@Module` metadata exports every token given.
 */
export function expectModuleExports(
  module: Type<unknown>,
  ...tokens: readonly unknown[]
): void {
  expectModuleMetadata(MODULE_METADATA.EXPORTS, module, tokens);
}

/**
 * Asserts that a module's `@Module` metadata imports every module given.
 */
export function expectModuleImports(
  module: Type<unknown>,
  ...modules: readonly unknown[]
): void {
  expectModuleMetadata(MODULE_METADATA.IMPORTS, module, modules);
}

/**
 * Asserts that a module's `@Module` metadata provides every provider given.
 */
export function expectModuleProvides(
  module: Type<unknown>,
  ...providers: readonly unknown[]
): void {
  expectModuleMetadata(MODULE_METADATA.PROVIDERS, module, providers);
}

/**
 * Asserts that one list in a module's metadata holds every entry given; a
 * module that declares no such list holds none.
 */
function expectModuleMetadata(
  key: string,
  module: Type<unknown>,
  entries: readonly unknown[],
): void {
  const declared: unknown = Reflect.getMetadata(key, module) ?? [];

  for (const entry of entries) {
    expect(declared, `${module.name} ${key}`).toContain(entry);
  }
}
