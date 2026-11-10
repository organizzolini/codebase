import { setupServer } from "msw/node";

/**
 * The MSW server a web client's tests answer GraphQL requests with. Tests add
 * their own handlers with `graphqlMockServer.use`.
 */
export const graphqlMockServer = setupServer();
