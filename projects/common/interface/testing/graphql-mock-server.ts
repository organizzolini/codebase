import { setupServer } from "msw/node";

/**
 * The MSW server a web client's tests answer GraphQL requests with; a test
 * adds the handlers it needs with `graphqlMockServer.use`, usually the typed ones
 * code generation emits.
 */
export const graphqlMockServer = setupServer();

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
