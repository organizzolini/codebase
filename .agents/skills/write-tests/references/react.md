# React Tests

Use Vitest and React Testing Library, beside the file under test. A web application's `testing/setup.ts` imports `@codebase/testing/react/setup`, the shared jsdom setup.

| File                      | Test                                | Shape                                                   |
| ------------------------- | ----------------------------------- | ------------------------------------------------------- |
| `user-card/user-card.tsx` | `user-card/user-card.unit.test.tsx` | `describe(UserCard, …)`, rendering with `render`        |
| `use-user/use-user.ts`    | `use-user/use-user.unit.test.ts`    | `describe(useUser, …)`, rendering with `renderHook`     |
| `word.$id.tsx`            | `word.$id.integration.test.tsx`     | `describe("word.$id", …)`, rendering with `renderRoute` |

`renderRoute` comes from `@codebase/testing/react` and takes the application's
router, as in `renderRoute(getRouter(), "/word/1")`: it loads the real route
tree in a memory history without the root's document shell, so the route's
loader, head, and page all run. That is why a route test is an integration test. The
distinct suffix is also what keeps a route's files from fitting the component
template when conformance is checked.

```typescript
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UserCard } from "./user-card";

describe(UserCard, () => {
  it("applies its class name", () => {
    const { container } = render(<UserCard className="card" userId="1" />);

    expect(container.firstElementChild?.className).toBe("card");
  });
});
```

## Server Functions and Browser APIs

A web application points `createServerFn` at `createServerFunctionStandIn` from its setup file, so a route's server function runs as plain code in the test. `matchMediaStandIn` stands in for `window.matchMedia`, which jsdom lacks. Both come from `@codebase/testing/react`.

The GraphQL mock server for a client test is in `@codebase/interface/testing`.
