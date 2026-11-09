import { Injectable } from "@nestjs/common";

import { TypescriptImportGraphService } from "./typescript-import-graph.service";
import { TypescriptProjectService } from "./typescript-project.service";

import type {
  TypescriptImportGraph,
  TypescriptProject,
  TypescriptProjectProgram,
} from "./typescript.types";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * The `typescript` module's public surface: discovers TypeScript projects, builds their
 * `ts.Program`s, and builds and renders their file-level import graphs. A facade over
 * `TypescriptProjectService` and `TypescriptImportGraphService`.
 */
@Injectable()
/* v8 ignore stop */
export class TypescriptService {
  // 🏗 Dependency Injection

  constructor(
    private readonly typescriptImportGraphService: TypescriptImportGraphService,
    private readonly typescriptProjectService: TypescriptProjectService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Builds a project's internal file-level import Graph from its program. */
  buildGraph(projectProgram: TypescriptProjectProgram): TypescriptImportGraph {
    return this.typescriptImportGraphService.buildGraph(projectProgram);
  }

  /** Builds one project's program, keeping the host and options alongside it. */
  buildProgram(project: TypescriptProject): TypescriptProjectProgram {
    return this.typescriptProjectService.buildProgram(project);
  }

  /**
   * Filters an already-read list of Nx projects down to the ones carrying
   * their own `tsconfig.json`, and describes each one.
   */
  discoverProjects(
    projects: { absoluteRoot: string; name: string }[],
  ): TypescriptProject[] {
    return this.typescriptProjectService.discoverProjects(projects);
  }

  /** Renders an import graph as a fenced mermaid diagram. */
  renderMermaid(graph: TypescriptImportGraph): string {
    return this.typescriptImportGraphService.renderMermaid(graph);
  }
}
