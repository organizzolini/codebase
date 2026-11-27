// ♟️ Constants

/** Store ids that must never reach the image: transpilers, tests, linters, bundlers. */
export const DEVELOPMENT_STORE_PREFIXES = [
  "@codebase+",
  "@fig+complete-commander@",
  "@golevelup+ts-vitest@",
  "@nestjs+testing@",
  "@oxc-project+",
  "@swc+",
  "@swc-node+",
  "@testcontainers+",
  "@vitest+",
  "eslint@",
  "prettier@",
  "rolldown@",
  "typescript@",
  "vite@",
  "vitest@",
] as const;

/** Files only a package's authors read; licenses stay. */
export const NON_RUNTIME_FILE =
  /^(?!licen[cs]e|notice|copying).*\.(?:d\.[cm]?ts|map|md|tsbuildinfo)$|\.(?:a|o)$/iu;

/** Test-only dependencies of shared packages the image omits; others must ship. */
export const NOT_SHIPPED = new Set([
  "@codebase/testing",
  "@golevelup/ts-vitest",
  "@nestjs/testing",
  "@testcontainers/postgresql",
  "typescript",
  "vitest",
]);

/** Shared packages compiled in, whose dependencies the image carries. */
export const SHARED_PACKAGES = [
  "projects/common/observability",
  "projects/common/persistence",
  "projects/caelundas/caelundas-db",
] as const;
