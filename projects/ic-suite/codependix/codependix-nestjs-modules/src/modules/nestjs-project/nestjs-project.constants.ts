// ♟️ Constants

/** Nx project tag that marks a project as one this package graphs. */
export const NESTJS_PROJECT_TAG = "framework:nestjs";

/** File suffix that marks a NestJS module definition. */
export const NESTJS_PROJECT_MODULE_FILE_SUFFIX = ".module.ts";

/** Framework modules skipped by name, since NestJS versions differ. */
export const NESTJS_PROJECT_IGNORED_MODULES: RegExp[] = [
  /^ConfigHostModule$/,
  /^InternalCoreModule$/,
  /^SyntheticRootModule$/,
  /^TypeOrmCoreModule$/,
];

/** Also skipped for a synthetic root, which is scaffolding. */
export const NESTJS_PROJECT_SYNTHETIC_IGNORED_MODULES: RegExp[] = [
  /^ConfigModule$/,
];
