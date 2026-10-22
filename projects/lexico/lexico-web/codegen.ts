import { createGraphqlCodegenConfig } from "@codebase/interface/client";

import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = createGraphqlCodegenConfig({
  schema: "../lexico-api/src/schema.gql",
});

export default config;
