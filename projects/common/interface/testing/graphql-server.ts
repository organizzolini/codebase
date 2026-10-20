import { setupServer } from "msw/node";

/**
 * The MSW server a web client's tests answer GraphQL requests with; a test
 * adds the handlers it needs with `graphqlServer.use`, usually the typed ones
 * code generation emits.
 */
export const graphqlServer = setupServer();

/**
 * Drops the handlers a test added, leaving the server as it started. Call it
 * from the project's Vitest `afterEach`.
 */
export function resetGraphqlServer(): void {
  graphqlServer.resetHandlers();
}

/**
 * Starts {@link graphqlServer} for a test file, failing any request that has
 * no handler. Call it from the project's Vitest `beforeAll`.
 */
export function startGraphqlServer(): void {
  graphqlServer.listen({ onUnhandledRequest: "error" });
}

/**
 * Stops {@link graphqlServer}. Call it from the project's Vitest `afterAll`.
 */
export function stopGraphqlServer(): void {
  graphqlServer.close();
}
