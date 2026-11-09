import { graphqlMockServer } from "./graphql-mock-server.constants";

/**
 * Drops the handlers a test added, leaving the server as it started. Call it
 * from the project's Vitest `afterEach`.
 */
export function resetGraphqlMockServer(): void {
  graphqlMockServer.resetHandlers();
}

/**
 * Starts {@link graphqlMockServer} for a test file, failing any request that has
 * no handler. Call it from the project's Vitest `beforeAll`.
 */
export function startGraphqlMockServer(): void {
  graphqlMockServer.listen({ onUnhandledRequest: "error" });
}

/**
 * Stops {@link graphqlMockServer}. Call it from the project's Vitest `afterAll`.
 */
export function stopGraphqlMockServer(): void {
  graphqlMockServer.close();
}
