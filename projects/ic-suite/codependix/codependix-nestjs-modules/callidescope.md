<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-nestjs-modules`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 58 |
| Files | 21 |
| Calls traced | 57 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 2 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 5 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

None.

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ModuleGraphService.buildGraph` | 7 | `ModuleGraphService.findAmbientModuleNames`, `ModuleGraphService.collectEdgesAndNodes`, `ModuleGraphService.toSorted(…)`, `ModuleGraphService.sortNames`, `ModuleGraphService.map(…)`, `ModuleGraphService.toSorted(…)`, `ModuleGraphService.filter(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:168` |
| `NestjsProjectService.exploreProject` | 5 | `NestjsProjectService.buildSyntheticRootModule`, `NestjsProjectService.loadRootModule`, `NestjsProjectService.discoverModuleDeclaringFiles`, `NestjsProjectService.exploreContainer`, `NestjsProjectService.map(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-project/nestjs-project.service.ts:248` |
| `NestjsModulesWorkspaceGraphService.buildWorkspaceGraph` | 4 | `NestjsModulesWorkspaceGraphService.sortNames`, `NestjsModulesWorkspaceGraphService.flatMap(…)`, `NestjsModulesWorkspaceGraphService.toSorted(…)`, `NestjsModulesWorkspaceGraphService.flatMap(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:80` |

<details>
<summary>26 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `NestjsProjectService.buildSyntheticRootModule` | 3 | `NestjsProjectService.findModuleFiles`, `NestjsProjectService.loadModuleClasses`, `SyntheticRootModule.forModules` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-project/nestjs-project.service.ts:58` |
| `NestjsProjectService.exploreContainer` | 3 | `NestjsProjectService.some(…)`, `NestjsProjectService.filter(…)`, `NestjsProjectService.map(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-project/nestjs-project.service.ts:122` |
| `ModuleGraphService.collectEdgesAndNodes` | 2 | `ModuleGraphService.addNode`, `ModuleGraphService.find(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:49` |
| `ModuleGraphService.renderMermaid` | 2 | `ModuleGraphService.map(…)`, `ModuleGraphService.map(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:203` |
| `NestjsModulesWorkspaceGraphService.renderMermaid` | 2 | `NestjsModulesWorkspaceGraphService.map(…)`, `NestjsModulesWorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:103` |
| `NestjsProjectService.discoverModuleDeclaringFiles` | 2 | `NestjsProjectService.findModuleFiles`, `NestjsProjectService.loadModuleClasses` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-project/nestjs-project.service.ts:81` |
| `NestjsProjectService.loadModuleClasses` | 2 | `NestjsProjectService.map(…)`, `NestjsProjectService.filter(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-project/nestjs-project.service.ts:171` |
| `NestjsProjectService.discoverProjects` | 2 | `NestjsProjectService.map(…)`, `NestjsProjectService.filter(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-project/nestjs-project.service.ts:232` |
| `ModuleGraphService.addNode` | 1 | `ModuleGraphService.some(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:61` |
| `ModuleGraphService.findAmbientModuleNames` | 1 | `ModuleGraphService.countInboundEdges` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:137` |
| `ModuleGraphService.sortNames` | 1 | `ModuleGraphService.toSorted(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:161` |
| `ModuleGraphService.toSorted(…)` | 1 | `ModuleGraphService.compareNodes` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:177` |
| `ModuleGraphService.toSorted(…)` | 1 | `ModuleGraphService.compareEdges` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:186` |
| `ModuleGraphService.map(…)` | 1 | `ModuleGraphService.renderNode` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:211` |
| `NestjsModulesWorkspaceGraphService.renderNode` | 1 | `NestjsModulesWorkspaceGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:60` |
| `NestjsModulesWorkspaceGraphService.sortNames` | 1 | `NestjsModulesWorkspaceGraphService.toSorted(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:65` |
| `NestjsModulesWorkspaceGraphService.flatMap(…)` | 1 | `NestjsModulesWorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:84` |
| `NestjsModulesWorkspaceGraphService.map(…)` | 1 | `NestjsModulesWorkspaceGraphService.qualifyModuleName` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:85` |
| `NestjsModulesWorkspaceGraphService.flatMap(…)` | 1 | `NestjsModulesWorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:91` |
| `NestjsModulesWorkspaceGraphService.map(…)` | 1 | `NestjsModulesWorkspaceGraphService.qualifyModuleName` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:92` |
| `NestjsModulesWorkspaceGraphService.toSorted(…)` | 1 | `NestjsModulesWorkspaceGraphService.compareEdges` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:97` |
| `NestjsModulesWorkspaceGraphService.map(…)` | 1 | `NestjsModulesWorkspaceGraphService.renderNode` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:111` |
| `NestjsModulesWorkspaceGraphService.map(…)` | 1 | `NestjsModulesWorkspaceGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-modules-workspace-graph/nestjs-modules-workspace-graph.service.ts:115` |
| `NestjsProjectService.findModuleFiles` | 1 | `NestjsProjectService.toSorted(…)` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-project/nestjs-project.service.ts:152` |
| `NestjsProjectService.filter(…)` | 1 | `NestjsProjectService.isNestjsProject` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-project/nestjs-project.service.ts:237` |
| `NestjsProjectService.map(…)` | 1 | `NestjsProjectService.describeProject` | `projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/nestjs-project/nestjs-project.service.ts:238` |

</details>
<!-- callidescope:end -->
