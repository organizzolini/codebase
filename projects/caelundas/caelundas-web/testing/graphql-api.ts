import { graphqlMockServer } from "@codebase/interface/testing";

/**
 * Serves the GraphQL endpoint a test's web code talks to, answering with the
 * typed handlers code generation emits (`mockEventsQuery` and the like).
 * `testing/setup.ts` starts the server and drops what a test added after it.
 */
export function serveGraphqlApi(
  ...handlers: Parameters<typeof graphqlMockServer.use>
): void {
  graphqlMockServer.use(...handlers);
}
