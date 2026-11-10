// ♟️ Constants

/** Methods a framework calls on a managed class. Naming them stops each being promoted as an orphan. */
export const LIFECYCLE_METHOD_NAMES = new Set([
  "beforeApplicationShutdown",
  "onApplicationBootstrap",
  "onApplicationShutdown",
  "onModuleDestroy",
  "onModuleInit",
]);

/** The method a decorated command class exposes to its runner. */
export const COMMAND_RUNNER_METHOD_NAME = "run";

/** Functions a module bootstraps itself through. */
export const BOOTSTRAP_FUNCTION_NAMES = new Set(["bootstrap", "main"]);

/** Ending of the file a project's runtime entry point lives in. */
export const BOOTSTRAP_FILE_SUFFIX = ".main.ts";

/** File a package's public surface is declared in. */
export const BARREL_FILE_SUFFIX = "/src/index.ts";
