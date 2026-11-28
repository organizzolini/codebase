<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-nx-projects`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 39 |
| Files | 16 |
| Calls traced | 41 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 1 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 4 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

None.

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `NeighborhoodService.buildNeighborhoods` | 8 | `NeighborhoodService.map(…)`, `NeighborhoodService.collectEdges`, `NeighborhoodService.sortNames`, `NeighborhoodService.map(…)`, `NeighborhoodService.filter(…)`, `NeighborhoodService.map(…)`, `NeighborhoodService.filter(…)`, `NeighborhoodService.toSorted(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:64` |
| `NeighborhoodService.renderMermaid` | 5 | `NeighborhoodService.sortNames`, `NeighborhoodService.map(…)`, `NeighborhoodService.map(…)`, `NeighborhoodService.toNodeIdentifier`, `NeighborhoodService.some(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:177` |
| `WorkspaceGraphService.buildWorkspaceGraph` | 5 | `WorkspaceGraphService.map(…)`, `NeighborhoodService.collectEdges`, `WorkspaceGraphService.toSorted(…)`, `NeighborhoodService.sortNames`, `WorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/workspace-graph/workspace-graph.service.ts:36` |

<details>
<summary>13 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `NeighborhoodService.resolveDependencyClosure` | 4 | `NeighborhoodService.filter(…)`, `NeighborhoodService.filter(…)`, `NeighborhoodService.map(…)`, `NeighborhoodService.sortNames` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:213` |
| `NeighborhoodService.readProjects` | 3 | `NeighborhoodService.toSorted(…)`, `NeighborhoodService.map(…)`, `NeighborhoodService.filter(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:158` |
| `WorkspaceGraphService.renderMermaid` | 3 | `WorkspaceGraphService.map(…)`, `WorkspaceGraphService.map(…)`, `WorkspaceGraphService.some(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/workspace-graph/workspace-graph.service.ts:54` |
| `NeighborhoodService.readProjectGraph` | 2 | `NeighborhoodService.isProjectGraph`, `InvalidProjectGraphError.constructor` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:143` |
| `NeighborhoodService.toSorted(…)` | 1 | `NeighborhoodService.compareEdges` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:85` |
| `NeighborhoodService.renderEdge` | 1 | `NeighborhoodService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:170` |
| `NeighborhoodService.map(…)` | 1 | `NeighborhoodService.renderNode` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:190` |
| `NeighborhoodService.map(…)` | 1 | `NeighborhoodService.renderEdge` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:191` |
| `NeighborhoodService.renderNode` | 1 | `NeighborhoodService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:205` |
| `NeighborhoodService.sortNames` | 1 | `NeighborhoodService.toSorted(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:244` |
| `WorkspaceGraphService.toSorted(…)` | 1 | `NeighborhoodService.compareEdges` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/workspace-graph/workspace-graph.service.ts:44` |
| `WorkspaceGraphService.map(…)` | 1 | `NeighborhoodService.renderNode` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/workspace-graph/workspace-graph.service.ts:62` |
| `WorkspaceGraphService.map(…)` | 1 | `NeighborhoodService.renderEdge` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/workspace-graph/workspace-graph.service.ts:65` |

</details>
<!-- callidescope:end -->
