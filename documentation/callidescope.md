<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `documentation`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 10 |
| Files | 15 |
| Calls traced | 3 |
| Call stacks | 1 |
| Deepest stack | 3 |
| Stacks through recursion | 0 |
| Unfollowable calls | 1 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `RefreshDocumentationCommand.run`** — depth 3 · decorated-method

```text
🚀 RefreshDocumentationCommand.run(): Promise<void> [documentation/src/modules/refresh-documentation/refresh-documentation.command.ts:39]
   ↳ Refreshes the documentation, failing the process when that fails.
  └─> RefreshDocumentationService.refresh(): Promise<boolean> [documentation/src/modules/refresh-documentation/refresh-documentation.service.ts:75]
     ↳ Updates the wiki from code, starting OpenWiki again after a growing wait when it fails, then puts the `openwiki`…
    └─> RefreshDocumentationService.exposeWiki(): boolean [documentation/src/modules/refresh-documentation/refresh-documentation.service.ts:48]
       ↳ Replaces the root `openwiki` symlink with the directory it points at.
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `RefreshDocumentationService.refresh` | 2 | `RefreshDocumentationService.exposeWiki`, `RefreshDocumentationService.restoreWiki` | `documentation/src/modules/refresh-documentation/refresh-documentation.service.ts:75` |
| `RefreshDocumentationCommand.run` | 1 | `RefreshDocumentationService.refresh` | `documentation/src/modules/refresh-documentation/refresh-documentation.command.ts:39` |
<!-- callidescope:end -->
