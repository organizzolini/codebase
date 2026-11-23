import { z } from "zod";

import type { ConformetryGeneratorInputDefinition } from "@conformetry/configuration";
import type { ConformetryNxConfiguration } from "@conformetry/nx";

export const CONFORMETRY_PATTERNS = [
  "configuration/ic-suite/conformetry.config.ts",
  "configuration/ic-suite/conformetry-templates/**",
] as const;

/**
 * Converts a Zod shape into the JSON Schema fragments conformetry reads as a
 * generator's inputs.
 */
function defineInputs(
  shape: z.ZodRawShape,
): Record<string, ConformetryGeneratorInputDefinition> {
  const schema = z.toJSONSchema(z.object(shape));
  const properties = schema.properties;

  if (properties === undefined) {
    return {};
  }

  const inputs: Record<string, ConformetryGeneratorInputDefinition> = {};

  for (const [name, definition] of Object.entries(properties)) {
    if (typeof definition === "object") {
      inputs[name] = definition;
    }
  }

  return inputs;
}

const conformetryConfiguration: ConformetryNxConfiguration = [
  // Groups without tags are plain workspace globs — the form a host with no
  // project graph writes, and the right one where the set of projects is not a
  // shape a tag describes.
  {
    description:
      "A standalone Python application template with a Jupyter notebook entry point, pytest/pyright/ruff tooling, and a shared uv workspace venv",
    inputs: defineInputs({
      description: z.string().describe("Application description"),
      name: z.string().describe("Application name in kebab-case"),
    }),
    instances: [{ patterns: ["projects/affirmancy"] }],
    name: "jupyter-notebook-application",
    templatePath:
      "configuration/ic-suite/conformetry-templates/jupyter-notebook-application",
  },
  {
    description:
      "A standalone NestJS CLI application template built on nest-commander, for a new command-line tool in projects/",
    inputs: defineInputs({
      name: z.string().describe("Project name (kebab-case)"),
      type: z
        .string()
        .describe(
          "Directory the project nests under, with a trailing slash: empty at the workspace root, projects/, a domain folder such as projects/lexico/, or a deeper nesting such as projects/ic-suite/callidescope/",
        ),
      workspaceRelativePrefix: z
        .string()
        .describe(
          "Relative climb from the project root back to the workspace root, e.g. ../.. two directories down or ../../../../ four directories down",
        ),
    }),
    instances: [
      {
        patterns: ["projects/ic-suite/callidescope/callidescope-cli"],
        substitutions: {
          type: "projects/ic-suite/callidescope/",
          workspaceRelativePrefix: "../../../../",
        },
      },
      {
        patterns: ["projects/ic-suite/codependix/codependix-cli"],
        substitutions: {
          type: "projects/ic-suite/codependix/",
          workspaceRelativePrefix: "../../../../",
        },
      },
      {
        patterns: ["projects/ic-suite/codometer/codometer-cli"],
        substitutions: {
          type: "projects/ic-suite/codometer/",
          workspaceRelativePrefix: "../../../../",
        },
      },
      {
        patterns: ["projects/ic-suite/coinagerie/coinagerie-cli"],
        substitutions: {
          type: "projects/ic-suite/coinagerie/",
          workspaceRelativePrefix: "../../../../",
        },
      },
      {
        patterns: ["projects/ic-suite/conformetry/conformetry-cli"],
        substitutions: {
          type: "projects/ic-suite/conformetry/",
          workspaceRelativePrefix: "../../../../",
        },
      },
      {
        patterns: ["compliance"],
        substitutions: {
          type: "",
          workspaceRelativePrefix: "../",
        },
      },
    ],
    name: "nestjs-command-project",
    templatePath:
      "configuration/ic-suite/conformetry-templates/nestjs-command-project",
  },
  {
    description:
      "A standalone NestJS GraphQL API application template, for a new backend service exposing a GraphQL schema over HTTP",
    inputs: defineInputs({
      name: z.string().describe("Application name in kebab-case"),
    }),
    instances: [
      {
        patterns: ["projects/caelundas/caelundas-api"],
      },
      {
        patterns: ["projects/lexico/lexico-api"],
      },
    ],
    name: "nestjs-graphql-application",
    templatePath:
      "configuration/ic-suite/conformetry-templates/nestjs-graphql-application",
  },
  {
    description:
      "A standalone NestJS TypeORM package template for shared entities and migrations, with a generated ERD target",
    inputs: defineInputs({
      databaseEntitiesConstant: z
        .string()
        .describe(
          "Exported constant containing the project's TypeORM entities",
        ),
      databaseModuleName: z
        .string()
        .describe("Database module directory and file stem in kebab-case"),
      databaseProject: z
        .string()
        .describe(
          "Project identifier used by the shared Postgres configuration",
        ),
      databaseProjectExpression: z
        .string()
        .describe(
          "TypeScript expression for the shared Postgres project setting",
        ),
      moduleClassName: z.string().describe("Database module class name"),
      name: z.string().describe("Project name (kebab-case)"),
      persistenceModuleImport: z
        .string()
        .describe("Named import for the shared persistence DatabaseModule"),
      persistenceModuleName: z
        .string()
        .describe("Local name of the shared persistence DatabaseModule"),
      serviceClassName: z.string().describe("Database service class name"),
      type: z
        .string()
        .describe(
          "Directory the project nests under, with a trailing slash: empty at the workspace root, projects/, a domain folder such as projects/lexico/, or a deeper nesting such as projects/ic-suite/callidescope/",
        ),
      workspaceRelativePrefix: z
        .string()
        .describe(
          "Relative climb from the project root back to the workspace root, e.g. ../.. two directories down or ../../../../ four directories down",
        ),
    }),
    instances: [
      {
        patterns: ["projects/lexico/lexico-db"],
        substitutions: {
          databaseEntitiesConstant: "LEXICO_DATABASE_ENTITIES",
          databaseModuleName: "database",
          databaseProject: "lexico",
          databaseProjectExpression: '"lexico"',
          moduleClassName: "DatabaseModule",
          name: "lexico-db",
          persistenceModuleImport:
            "DatabaseModule as PersistenceDatabaseModule",
          persistenceModuleName: "PersistenceDatabaseModule",
          serviceClassName: "DatabaseService",
          type: "projects/lexico/",
          workspaceRelativePrefix: "../../../",
        },
      },
      {
        patterns: ["projects/caelundas/caelundas-db"],
        substitutions: {
          databaseEntitiesConstant: "CAELUNDAS_DATABASE_ENTITIES",
          databaseModuleName: "caelundas-database",
          databaseProject: "caelundas",
          databaseProjectExpression: '"caelundas"',
          moduleClassName: "CaelundasDatabaseModule",
          name: "caelundas-db",
          persistenceModuleImport:
            "DatabaseModule as PersistenceDatabaseModule",
          persistenceModuleName: "PersistenceDatabaseModule",
          serviceClassName: "CaelundasDatabaseService",
          type: "projects/caelundas/",
          workspaceRelativePrefix: "../../../",
        },
      },
      {
        patterns: ["projects/meanderaw/meanderaw-db"],
        substitutions: {
          databaseEntitiesConstant: "MEANDERAW_DATABASE_ENTITIES",
          databaseModuleName: "meanderaw-database",
          databaseProject: "meanderaw",
          databaseProjectExpression: "MEANDERAW_PROJECT",
          moduleClassName: "MeanderawDatabaseModule",
          name: "meanderaw-db",
          persistenceModuleImport: "DatabaseModule",
          persistenceModuleName: "DatabaseModule",
          serviceClassName: "MeanderawDatabaseService",
          type: "projects/meanderaw/",
          workspaceRelativePrefix: "../../../",
        },
      },
    ],
    name: "nestjs-database-project",
    templatePath:
      "configuration/ic-suite/conformetry-templates/nestjs-database-project",
  },
  {
    description:
      "A standalone NestJS library package template for internal workspace code shared across projects, with no CLI entry point or HTTP server",
    inputs: defineInputs({
      name: z.string().describe("Project name (kebab-case)"),
      type: z
        .string()
        .describe(
          "Directory the project nests under, with a trailing slash: empty at the workspace root, projects/, a domain folder such as projects/lexico/, or a deeper nesting such as projects/ic-suite/callidescope/",
        ),
      workspaceRelativePrefix: z
        .string()
        .describe(
          "Relative climb from the project root back to the workspace root, e.g. ../.. two directories down or ../../../../ four directories down",
        ),
    }),
    instances: [
      {
        patterns: [
          "projects/ic-suite/callidescope/callidescope-!(agents|cli|examples)",
        ],
        substitutions: {
          type: "projects/ic-suite/callidescope/",
          workspaceRelativePrefix: "../../../../",
        },
      },
      {
        patterns: [
          "projects/ic-suite/codependix/codependix-!(agents|cli|examples)",
        ],
        substitutions: {
          type: "projects/ic-suite/codependix/",
          workspaceRelativePrefix: "../../../../",
        },
      },
      {
        patterns: [
          "projects/ic-suite/codometer/codometer-!(agents|cli|examples)",
        ],
        substitutions: {
          type: "projects/ic-suite/codometer/",
          workspaceRelativePrefix: "../../../../",
        },
      },
      {
        patterns: [
          "projects/ic-suite/coinagerie/coinagerie-!(agents|cli|examples)",
        ],
        substitutions: {
          type: "projects/ic-suite/coinagerie/",
          workspaceRelativePrefix: "../../../../",
        },
      },
      {
        patterns: [
          "projects/ic-suite/conformetry/conformetry-!(agents|cli|examples)",
        ],
        substitutions: {
          type: "projects/ic-suite/conformetry/",
          workspaceRelativePrefix: "../../../../",
        },
      },
    ],
    name: "nestjs-service-project",
    templatePath:
      "configuration/ic-suite/conformetry-templates/nestjs-service-project",
  },
  {
    description:
      "A standalone TanStack Start web application template — server rendering, file-based routes, Tailwind CSS, and Vitest — for a new frontend in projects/",
    inputs: defineInputs({
      name: z.string().describe("Application name in kebab-case"),
    }),
    // Where existing applications live is also where a new one may be
    // generated. The template reaches the shared configuration by package name,
    // so it states no climb back to the workspace root and no group has to.
    instances: [
      {
        // The `node_modules` links would otherwise be followed back to the
        // packages they point at.
        exclude: ["projects/**/node_modules/**"],
        patterns: ["projects/**/*-web"],
      },
    ],
    name: "tanstack-application",
    templatePath:
      "configuration/ic-suite/conformetry-templates/tanstack-application",
  },

  // Groups with tags pick the projects the template suits — which is what
  // `nx g` prompts with — and read their globs inside each one, so where a
  // generator belongs is stated exactly once.
  {
    description:
      "A nest-commander command module template — command, module, constants, types, and unit test — for an existing NestJS command-line project",
    inputs: defineInputs({
      name: z.string().describe("Module name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: ["src/modules/*"],
        tags: ["framework:nest-commander"],
      },
    ],
    name: "nestjs-command-module",
    templatePath:
      "configuration/ic-suite/conformetry-templates/nestjs-command-module",
  },
  {
    description:
      "A GraphQL dataloader module template — dataloader, module, types, and unit test — for batching lookups inside an existing NestJS project",
    inputs: defineInputs({
      name: z.string().describe("Module name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: ["src/modules/*"],
        tags: ["framework:nestjs", "language:graphql"],
      },
    ],
    name: "nestjs-dataloader-module",
    templatePath:
      "configuration/ic-suite/conformetry-templates/nestjs-dataloader-module",
  },
  {
    description:
      "A GraphQL module template — resolver, entities, args/input types, factories, constants, and unit test — for an existing NestJS project",
    inputs: defineInputs({
      name: z.string().describe("Module name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: ["src/modules/*"],
        tags: ["framework:nestjs", "language:graphql"],
      },
    ],
    name: "nestjs-graphql-module",
    templatePath:
      "configuration/ic-suite/conformetry-templates/nestjs-graphql-module",
  },
  {
    description:
      "A service and unit test file template for an existing NestJS module, without the surrounding module files",
    inputs: defineInputs({
      module: z.string().describe("Target module name in kebab-case"),
      name: z.string().describe("Service name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: [
          "src/modules/*/*.service.ts",
          "src/modules/*/*.service.unit.test.ts",
        ],
        tags: ["framework:nestjs"],
      },
    ],
    name: "nestjs-service-file",
    templatePath:
      "configuration/ic-suite/conformetry-templates/nestjs-service-file",
  },
  {
    description:
      "A resolver and unit test file template for an existing NestJS module, without the surrounding module files",
    inputs: defineInputs({
      module: z.string().describe("Target module name in kebab-case"),
      name: z.string().describe("Resolver name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: [
          "src/modules/*/*.resolver.ts",
          "src/modules/*/*.resolver.unit.test.ts",
        ],
        tags: ["framework:nestjs", "language:graphql"],
      },
    ],
    name: "nestjs-resolver-file",
    templatePath:
      "configuration/ic-suite/conformetry-templates/nestjs-resolver-file",
  },
  {
    description:
      "A plain service module template — module, service, constants, types, and unit test — for an existing NestJS project",
    inputs: defineInputs({
      name: z.string().describe("Module name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: ["src/modules/*"],
        tags: ["framework:nestjs"],
      },
    ],
    name: "nestjs-service-module",
    templatePath:
      "configuration/ic-suite/conformetry-templates/nestjs-service-module",
  },
  // The extglob in each frontend source pattern keeps a test file from being read as an
  // instance named after itself. Instances match the template their files fit, so a route's
  // test is `.integration.test.tsx` and `index.tsx` fits only its own template.
  {
    description:
      "A React component folder — the component, its types, constants, and utilities, and its unit test — in a feature folder under src/components of an existing React application",
    inputs: defineInputs({
      name: z.string().describe("Component name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: ["src/components/*/*"],
        tags: ["framework:react", "type:application"],
      },
    ],
    name: "react-component-folder",
    templatePath:
      "configuration/ic-suite/conformetry-templates/react-component-folder",
  },
  {
    description:
      "A React component and its unit test, added to an existing component folder of a React application",
    inputs: defineInputs({
      module: z
        .string()
        .describe("Component folder to add the component to, in kebab-case"),
      name: z.string().describe("Component name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: [
          "src/components/*/*/!(*.test).tsx",
          "src/components/*/*/*.unit.test.tsx",
        ],
        tags: ["framework:react", "type:application"],
      },
    ],
    name: "react-component-file",
    templatePath:
      "configuration/ic-suite/conformetry-templates/react-component-file",
  },
  {
    description:
      "A React hook folder — the hook, the result type it returns, its constants and utilities, and its unit test — in src/hooks of an existing React application",
    inputs: defineInputs({
      name: z
        .string()
        .regex(/^use-[a-z0-9-]+$/u)
        .describe("Hook name in kebab-case, starting with use-"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: ["src/hooks/*"],
        tags: ["framework:react", "type:application"],
      },
    ],
    name: "react-hook-folder",
    templatePath:
      "configuration/ic-suite/conformetry-templates/react-hook-folder",
  },
  {
    description:
      "A React hook, the result type it returns, and its unit test, added to an existing hook folder of a React application",
    inputs: defineInputs({
      module: z
        .string()
        .describe("Hook folder to add the hook to, in kebab-case"),
      name: z
        .string()
        .regex(/^use-[a-z0-9-]+$/u)
        .describe("Hook name in kebab-case, starting with use-"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: ["src/hooks/*/use-+([a-z0-9-]).ts"],
        tags: ["framework:react", "type:application"],
      },
    ],
    name: "react-hook-file",
    templatePath:
      "configuration/ic-suite/conformetry-templates/react-hook-file",
  },
  {
    description:
      "A TanStack Start file route and integration test template — the route and the page it renders — for an existing TanStack Start project",
    inputs: defineInputs({
      name: z
        .string()
        .describe(
          "Route file stem as TanStack Router names it, e.g. index, search, or word.$id",
        ),
      project: z.string().describe("Parent project name in kebab-case"),
      path: z
        .string()
        .describe("URL path the route serves, e.g. /, /search, or /word/$id"),
    }),
    instances: [
      {
        patterns: [
          "src/routes/!(__root|*.integration.test).tsx",
          "src/routes/*.integration.test.tsx",
        ],
        tags: ["framework:tanstack-start"],
      },
    ],
    name: "tanstack-route",
    templatePath: "configuration/ic-suite/conformetry-templates/tanstack-route",
  },
  {
    description:
      "A TanStack Start server function module template — GET and POST server functions, the utilities behind them, schemas, types, and unit test — for an existing TanStack Start project",
    inputs: defineInputs({
      name: z.string().describe("Module name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      { patterns: ["src/modules/*"], tags: ["framework:tanstack-start"] },
    ],
    name: "tanstack-server-function",
    templatePath:
      "configuration/ic-suite/conformetry-templates/tanstack-server-function",
  },
];

export default conformetryConfiguration;
