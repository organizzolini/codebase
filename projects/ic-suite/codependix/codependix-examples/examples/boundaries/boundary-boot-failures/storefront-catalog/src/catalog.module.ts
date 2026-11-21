import { Module } from "@nestjs/common";

/**
 * Deliberately broken: the file throws as it is evaluated. It stands in for a
 * circular import, where a decorator reads a half-built class and throws
 * `Cannot access 'X' before initialization`.
 */
@Module({})
export class CatalogModule {}

throw new Error("The storefront catalog cannot be loaded.");
