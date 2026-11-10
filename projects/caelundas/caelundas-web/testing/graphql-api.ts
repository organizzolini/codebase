import { graphqlMockServer } from "@codebase/interface/testing";

/**
 * Serves the GraphQL endpoint a test's web code talks to, answering with the typed generated handlers.
 */
export function serveGraphqlApi(
  ...handlers: Parameters<typeof graphqlMockServer.use>
): void {
  graphqlMockServer.use(...handlers);
}
