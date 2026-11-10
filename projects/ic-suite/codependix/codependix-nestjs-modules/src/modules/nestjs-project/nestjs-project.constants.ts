// ♟️ Constants

/** Nx project tag that marks a project as one this package graphs. */
export const NESTJS_PROJECT_TAG = "framework:nestjs";

/** File suffix that marks a NestJS module definition. */
export const NESTJS_PROJECT_MODULE_FILE_SUFFIX = ".module.ts";

/**
 * Framework modules skipped from a project's graph. Matched by name: NestJS 11
 * and 12 export `InternalCoreModule` from different paths.
 */
export const NESTJS_PROJECT_IGNORED_MODULES: RegExp[] = [
  /^ConfigHostModule$/,
  /^InternalCoreModule$/,
  /^SyntheticRootModule$/,
  /^TypeOrmCoreModule$/,
];

/**
 * Also skipped when the root is synthetic: the scaffolding that lets a
 * package's `useFactory` modules scan, not the project's own.
 */
export const NESTJS_PROJECT_SYNTHETIC_IGNORED_MODULES: RegExp[] = [
  /^ConfigModule$/,
];
