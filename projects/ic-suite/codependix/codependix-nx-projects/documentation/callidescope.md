<!-- callidescope:start -->

## 🔭 Callidescope

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
| `NeighborhoodService.buildNeighborhoods` | 8 | `NeighborhoodService.map(…)`, `NeighborhoodService.collectEdges`, `NeighborhoodService.sortNames`, `NeighborhoodService.map(…)`, `NeighborhoodService.filter(…)`, `NeighborhoodService.map(…)`, `NeighborhoodService.filter(…)`, `NeighborhoodService.toSorted(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:76` |
| `NeighborhoodService.renderMermaid` | 5 | `NeighborhoodService.sortNames`, `NeighborhoodService.map(…)`, `NeighborhoodService.map(…)`, `NeighborhoodService.toNodeIdentifier`, `NeighborhoodService.some(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:205` |
| `WorkspaceGraphService.buildWorkspaceGraph` | 5 | `WorkspaceGraphService.map(…)`, `NeighborhoodService.collectEdges`, `WorkspaceGraphService.toSorted(…)`, `NeighborhoodService.sortNames`, `WorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/workspace-graph/workspace-graph.service.ts:42` |

<details>
<summary>13 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `NeighborhoodService.resolveDependencyClosure` | 4 | `NeighborhoodService.filter(…)`, `NeighborhoodService.filter(…)`, `NeighborhoodService.map(…)`, `NeighborhoodService.sortNames` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:247` |
| `NeighborhoodService.readProjects` | 3 | `NeighborhoodService.toSorted(…)`, `NeighborhoodService.map(…)`, `NeighborhoodService.filter(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:186` |
| `WorkspaceGraphService.renderMermaid` | 3 | `WorkspaceGraphService.map(…)`, `WorkspaceGraphService.map(…)`, `WorkspaceGraphService.some(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/workspace-graph/workspace-graph.service.ts:60` |
| `NeighborhoodService.readProjectGraph` | 2 | `NeighborhoodService.isProjectGraph`, `InvalidProjectGraphError.constructor` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:171` |
| `NeighborhoodService.toSorted(…)` | 1 | `NeighborhoodService.compareEdges` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:97` |
| `NeighborhoodService.renderEdge` | 1 | `NeighborhoodService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:198` |
| `NeighborhoodService.map(…)` | 1 | `NeighborhoodService.renderNode` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:218` |
| `NeighborhoodService.map(…)` | 1 | `NeighborhoodService.renderEdge` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:219` |
| `NeighborhoodService.renderNode` | 1 | `NeighborhoodService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:233` |
| `NeighborhoodService.sortNames` | 1 | `NeighborhoodService.toSorted(…)` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/neighborhood/neighborhood.service.ts:278` |
| `WorkspaceGraphService.toSorted(…)` | 1 | `NeighborhoodService.compareEdges` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/workspace-graph/workspace-graph.service.ts:50` |
| `WorkspaceGraphService.map(…)` | 1 | `NeighborhoodService.renderNode` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/workspace-graph/workspace-graph.service.ts:68` |
| `WorkspaceGraphService.map(…)` | 1 | `NeighborhoodService.renderEdge` | `projects/ic-suite/codependix/codependix-nx-projects/src/modules/workspace-graph/workspace-graph.service.ts:71` |

</details>
<!-- callidescope:end -->
