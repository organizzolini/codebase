import { setupServer } from "msw/node";

/** The MSW server answering GraphQL in tests; add handlers with `use`. */
export const graphqlMockServer = setupServer();
