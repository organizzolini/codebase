import {
  BoundariesService,
  BoundaryCheckService,
  BoundaryCyclesService,
  BoundaryFailureService,
  BoundaryGraphService,
  BoundaryOutcomeReportService,
  BoundaryReportService,
  BoundarySelectorService,
  RunContextService,
} from "@codependix/boundaries";
import {
  ConfigurationModule,
  ConfigurationService,
} from "@codependix/configuration";
import {
  FileImportsWorkspaceGraphService,
  PythonImportGraphService,
  PythonImportParserService,
  PythonProjectService,
  PythonService,
  TypescriptImportGraphService,
  TypescriptProjectService,
  TypescriptService,
} from "@codependix/file-imports";
import {
  ModuleGraphService,
  NestjsModulesWorkspaceGraphService,
  NestjsProjectService,
} from "@codependix/nestjs-modules";
import {
  NeighborhoodService,
  WorkspaceGraphService,
} from "@codependix/nx-projects";
import {
  AnchorsService,
  DeliveryService,
  PathQueryService,
} from "@codependix/output";
import { NestFactory } from "@nestjs/core";

import { LoggerService } from "@codebase/observability";

import type { INestApplicationContext } from "@nestjs/common";

// ♟️ Constants

/** Builders wired by hand as `@codependix/cli` does; see `getConfigurationService`. */
const logger = new LoggerService();

/** Reads the Nx project graph and renders a one-hop Neighborhood. */
export const neighborhoodService = new NeighborhoodService();

/** Renders the whole-workspace Nx graph. */
export const workspaceGraphService = new WorkspaceGraphService(
  neighborhoodService,
);

/** Explores a NestJS project's container in preview mode. */
export const nestjsProjectService = new NestjsProjectService(logger);

/** Reduces an explored container to a module graph and renders it. */
export const moduleGraphService = new ModuleGraphService();

/** Discovers TypeScript projects and builds each one's `ts.Program`. */
export const typescriptProjectService = new TypescriptProjectService();

/** Builds and renders a project's TypeScript file-level import graph. */
export const typescriptService = new TypescriptService(
  new TypescriptImportGraphService(typescriptProjectService),
  typescriptProjectService,
);

/** Discovers Python projects and lists each one's source files. */
export const pythonProjectService = new PythonProjectService();

/** Builds and renders a project's Python file-level import graph. */
export const pythonService = new PythonService(
  new PythonImportGraphService(
    new PythonImportParserService(),
    pythonProjectService,
  ),
  pythonProjectService,
);

/** Shared booted `ConfigurationModule`, or `undefined` until first asked. */
let configurationContextPromise: Promise<INestApplicationContext> | undefined;

/**
 * Closes the container `getConfigurationService` booted. Called once the run is over; an open context holds the process open.
 */
export async function closeConfigurationService(): Promise<void> {
  if (configurationContextPromise !== undefined) {
    const context = await configurationContextPromise;
    await context.close();
    configurationContextPromise = undefined;
  }
}

/**
 * Resolves a configuration file's export destinations, plus command-line overrides. Booted from
 * `ConfigurationModule`, which exposes the package's one public service.
 */
export async function getConfigurationService(): Promise<ConfigurationService> {
  configurationContextPromise ??= NestFactory.createApplicationContext(
    ConfigurationModule,
    { logger: false },
  );

  const context = await configurationContextPromise;

  return context.get(ConfigurationService);
}

/**
 * Resolves the run context a `--projects` run builds: its selection and dependency closure.
 */
export async function getRunContextService(): Promise<RunContextService> {
  return new RunContextService(
    await getConfigurationService(),
    neighborhoodService,
  );
}

/** Reads and rewrites codependix's own named anchor blocks. */
export const anchorsService = new AnchorsService();

/** Turns a resolved export configuration into file I/O. */
export const deliveryService = new DeliveryService(anchorsService);

/** Judges a built graph against declared boundary rules. */
export const boundariesService = new BoundariesService(
  new BoundaryCyclesService(),
  new BoundarySelectorService(),
);

/** Renders boundary violations into the lines a run prints. */
export const boundaryReportService = new BoundaryReportService();

/** Reports what a boundary pass found, charged to projects and judged. */
export const boundaryOutcomeReportService = new BoundaryOutcomeReportService(
  boundaryReportService,
);

/** Judges every level against its rules, charging findings to projects. */
export const boundaryCheckService = new BoundaryCheckService(
  boundariesService,
  new BoundaryFailureService(neighborhoodService),
  new BoundaryGraphService(),
  moduleGraphService,
  nestjsProjectService,
  pythonService,
  typescriptService,
  workspaceGraphService,
);

/** Combines project-level file imports into a workspace graph. */
export const fileImportsWorkspaceGraphService =
  new FileImportsWorkspaceGraphService();

/** Combines NestJS module graphs into a workspace graph. */
export const nestjsModulesWorkspaceGraphService =
  new NestjsModulesWorkspaceGraphService();

/** Finds shortest paths across codependix graph levels and renders results. */
export const pathQueryService = new PathQueryService(
  fileImportsWorkspaceGraphService,
  moduleGraphService,
  nestjsModulesWorkspaceGraphService,
  nestjsProjectService,
  pythonService,
  typescriptService,
  workspaceGraphService,
);
