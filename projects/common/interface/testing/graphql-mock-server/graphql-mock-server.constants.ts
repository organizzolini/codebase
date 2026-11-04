import { setupServer } from "msw/node";

/**
 * The MSW server a web client's tests answer GraphQL requests with; a test
 * adds the handlers it needs with `graphqlMockServer.use`, usually the typed ones
 * code generation emits.
 */
export const graphqlMockServer = setupServer();
