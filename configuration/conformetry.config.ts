import path from "node:path";

import { z } from "zod";

import type { ConformetryGeneratorInputDefinition } from "@conformetry/configuration";
import type {
  ConformetryNxConfiguration,
  ConformetryNxInstanceGroup,
} from "@conformetry/nx";

export const CONFORMETRY_PATTERNS = [
  "configuration/conformetry.config.ts",
  "configuration/conformetry-templates/**",
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

/**
 * A project's baseline per kind of instance. Its `src/modules/*` directories
 * are one kind whichever module template fits: the first group to find a path
 * sets its threshold.
 */
interface TestTemplateBaseline {
  readonly application?: number;
  readonly modules?: number;
  readonly resolvers?: number;
  readonly routes?: number;
  readonly services?: number;
}

/** What each untouched project of a shape measures, shared to stay short. */
const NEST_BASELINE = { modules: 89 / 121, services: 47 / 79 };
const CLI_BASELINE = { modules: 149 / 191 };
/** Each ic-suite CLI's `nestjs-command-project` score, set on its own group. */
const COMMAND_PROJECT_BASELINE = 795 / 798;

/**
 * Each project's measured conformance score, written as requirements met over
 * requirements weighed, from when the test templates moved onto
 * `@codebase/testing` (#329). A kind holds the lowest score among the
 * project's instances of it, so validation passes before its tests migrate.
 * A project's migration deletes its entry, and an ic-suite CLI's also deletes
 * its `nestjs-command-project` threshold, which raises it back to 1. The last
 * migration deletes the table.
 */
const TEST_TEMPLATE_BASELINES: Record<string, TestTemplateBaseline> = {
  documentation: NEST_BASELINE,
  installation: NEST_BASELINE,
  integration: NEST_BASELINE,
  "projects/caelundas/caelundas-cli": NEST_BASELINE,
  "projects/caelundas/caelundas-web": {
    application: 748 / 764,
    routes: 137 / 145,
  },
  "projects/common/observability": NEST_BASELINE,
  "projects/common/persistence": NEST_BASELINE,
  "projects/ic-suite/codependix/codependix-boundaries": NEST_BASELINE,
  "projects/ic-suite/codependix/codependix-cli": CLI_BASELINE,
  "projects/ic-suite/codependix/codependix-configuration": NEST_BASELINE,
  "projects/ic-suite/codependix/codependix-core": NEST_BASELINE,
  "projects/ic-suite/codependix/codependix-file-imports": NEST_BASELINE,
  "projects/ic-suite/codependix/codependix-nestjs-modules": NEST_BASELINE,
  "projects/ic-suite/codependix/codependix-nx": NEST_BASELINE,
  "projects/ic-suite/codependix/codependix-nx-projects": NEST_BASELINE,
  "projects/ic-suite/codependix/codependix-output": NEST_BASELINE,
  "projects/ic-suite/codometer/codometer-cli": CLI_BASELINE,
  "projects/ic-suite/codometer/codometer-configuration": NEST_BASELINE,
  "projects/ic-suite/codometer/codometer-core": NEST_BASELINE,
  "projects/ic-suite/codometer/codometer-languages": NEST_BASELINE,
  "projects/ic-suite/codometer/codometer-measurement": NEST_BASELINE,
  "projects/ic-suite/codometer/codometer-output": NEST_BASELINE,
  "projects/ic-suite/coinagerie/coinagerie-cli": CLI_BASELINE,
  "projects/ic-suite/coinagerie/coinagerie-configuration": NEST_BASELINE,
  "projects/ic-suite/coinagerie/coinagerie-core": NEST_BASELINE,
  "projects/ic-suite/coinagerie/coinagerie-languages": NEST_BASELINE,
  "projects/ic-suite/coinagerie/coinagerie-nx": NEST_BASELINE,
  "projects/ic-suite/coinagerie/coinagerie-output": NEST_BASELINE,
  "projects/ic-suite/coinagerie/coinagerie-vocabulary": NEST_BASELINE,
  "projects/ic-suite/conformetry/conformetry-cli": CLI_BASELINE,
  "projects/ic-suite/conformetry/conformetry-configuration": NEST_BASELINE,
  "projects/ic-suite/conformetry/conformetry-core": NEST_BASELINE,
  "projects/ic-suite/conformetry/conformetry-generation": NEST_BASELINE,
  "projects/ic-suite/conformetry/conformetry-languages": NEST_BASELINE,
  "projects/ic-suite/conformetry/conformetry-nx": NEST_BASELINE,
  "projects/ic-suite/conformetry/conformetry-output": NEST_BASELINE,
  "projects/ic-suite/conformetry/conformetry-validation": NEST_BASELINE,
  "projects/lexico/lexico-api": {
    modules: 89 / 121,
    resolvers: 46 / 78,
    services: 47 / 79,
  },
  "projects/lexico/lexico-cli": NEST_BASELINE,
  "projects/lexico/lexico-entities": NEST_BASELINE,
  "projects/lexico/lexico-web": { application: 743 / 764, routes: 131 / 145 },
  "projects/meanderaw/meanderaw-cli": NEST_BASELINE,
  "projects/meanderaw/meanderaw-web": {
    application: 742 / 764,
    routes: 131 / 145,
  },
  publication: NEST_BASELINE,
  synchronization: NEST_BASELINE,
  validation: NEST_BASELINE,
};

/**
 * Puts a group per project in `TEST_TEMPLATE_BASELINES`, held to its measured
 * score, ahead of `group`, so it finds those projects' instances first.
 */
function withBaselines(
  kind: keyof TestTemplateBaseline,
  group: ConformetryNxInstanceGroup,
  patterns: string[] = group.patterns ?? [],
): ConformetryNxInstanceGroup[] {
  const entries = Object.entries(TEST_TEMPLATE_BASELINES);
  const groups = entries.flatMap(([root, baseline]) => {
    const threshold = baseline[kind];
    const rooted = patterns.map((pattern) => {
      return path.posix.join(root, pattern);
    });

    return threshold === undefined ? [] : [{ patterns: rooted, threshold }];
  });

  return [...groups, group];
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
      "configuration/conformetry-templates/jupyter-notebook-application",
  },
  {
    description:
      "A standalone NestJS CLI application template built on nest-commander, for a new command-line tool in projects/",
    inputs: defineInputs({
      name: z.string().describe("Project name (kebab-case)"),
      type: z
        .string()
        .describe(
          "Directory the project nests under: projects, a domain folder such as projects/lexico, or a deeper nesting such as projects/ic-suite/callidescope",
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
          type: "projects/ic-suite/callidescope",
          workspaceRelativePrefix: "../../../../",
        },
      },
      {
        patterns: ["projects/ic-suite/codependix/codependix-cli"],
        substitutions: {
          type: "projects/ic-suite/codependix",
          workspaceRelativePrefix: "../../../../",
        },
        threshold: COMMAND_PROJECT_BASELINE,
      },
      {
        patterns: ["projects/ic-suite/codometer/codometer-cli"],
        substitutions: {
          type: "projects/ic-suite/codometer",
          workspaceRelativePrefix: "../../../../",
        },
        threshold: COMMAND_PROJECT_BASELINE,
      },
      {
        patterns: ["projects/ic-suite/coinagerie/coinagerie-cli"],
        substitutions: {
          type: "projects/ic-suite/coinagerie",
          workspaceRelativePrefix: "../../../../",
        },
        threshold: COMMAND_PROJECT_BASELINE,
      },
      {
        patterns: ["projects/ic-suite/conformetry/conformetry-cli"],
        substitutions: {
          type: "projects/ic-suite/conformetry",
          workspaceRelativePrefix: "../../../../",
        },
        threshold: COMMAND_PROJECT_BASELINE,
      },
    ],
    name: "nestjs-command-project",
    templatePath: "configuration/conformetry-templates/nestjs-command-project",
  },
  {
    description:
      "A standalone NestJS GraphQL API application template, for a new backend service exposing a GraphQL schema over HTTP",
    inputs: defineInputs({
      name: z.string().describe("Application name in kebab-case"),
    }),
    instances: [],
    name: "nestjs-graphql-application",
    templatePath:
      "configuration/conformetry-templates/nestjs-graphql-application",
  },
  {
    description:
      "A standalone NestJS library package template for internal workspace code shared across projects, with no CLI entry point or HTTP server",
    inputs: defineInputs({
      name: z.string().describe("Project name (kebab-case)"),
      type: z
        .string()
        .describe(
          "Directory the project nests under: projects, a domain folder such as projects/lexico, or a deeper nesting such as projects/ic-suite/callidescope",
        ),
      workspaceRelativePrefix: z
        .string()
        .describe(
          "Relative climb from the project root back to the workspace root, e.g. ../.. two directories down or ../../../../ four directories down",
        ),
    }),
    instances: [],
    name: "nestjs-service-project",
    templatePath: "configuration/conformetry-templates/nestjs-service-project",
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
    instances: withBaselines(
      "application",
      {
        // The `node_modules` links would otherwise be followed back to the
        // packages they point at.
        exclude: ["projects/**/node_modules/**"],
        patterns: ["projects/**/*-web"],
      },
      ["."],
    ),
    name: "tanstack-application",
    templatePath: "configuration/conformetry-templates/tanstack-application",
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
    instances: withBaselines("modules", {
      patterns: ["src/modules/*"],
      tags: ["framework:nest-commander"],
    }),
    name: "nestjs-command-module",
    templatePath: "configuration/conformetry-templates/nestjs-command-module",
  },
  {
    description:
      "A GraphQL dataloader module template — dataloader, module, types, and unit test — for batching lookups inside an existing NestJS project",
    inputs: defineInputs({
      name: z.string().describe("Module name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: withBaselines("modules", {
      patterns: ["src/modules/*"],
      tags: ["framework:nestjs", "language:graphql"],
    }),
    name: "nestjs-dataloader-module",
    templatePath:
      "configuration/conformetry-templates/nestjs-dataloader-module",
  },
  {
    description:
      "A GraphQL module template — resolver, entities, args/input types, factories, constants, and unit test — for an existing NestJS project",
    inputs: defineInputs({
      name: z.string().describe("Module name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: withBaselines("modules", {
      patterns: ["src/modules/*"],
      tags: ["framework:nestjs", "language:graphql"],
    }),
    name: "nestjs-graphql-module",
    templatePath: "configuration/conformetry-templates/nestjs-graphql-module",
  },
  {
    description:
      "A service and unit test file template for an existing NestJS module, without the surrounding module files",
    inputs: defineInputs({
      module: z.string().describe("Target module name in kebab-case"),
      name: z.string().describe("Service name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: withBaselines("services", {
      patterns: [
        "src/modules/*/*.service.ts",
        "src/modules/*/*.service.unit.test.ts",
      ],
      tags: ["framework:nestjs"],
    }),
    name: "nestjs-service-file",
    templatePath: "configuration/conformetry-templates/nestjs-service-file",
  },
  {
    description:
      "A resolver and unit test file template for an existing NestJS module, without the surrounding module files",
    inputs: defineInputs({
      module: z.string().describe("Target module name in kebab-case"),
      name: z.string().describe("Resolver name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: withBaselines("resolvers", {
      patterns: [
        "src/modules/*/*.resolver.ts",
        "src/modules/*/*.resolver.unit.test.ts",
      ],
      tags: ["framework:nestjs", "language:graphql"],
    }),
    name: "nestjs-resolver-file",
    templatePath: "configuration/conformetry-templates/nestjs-resolver-file",
  },
  {
    description:
      "A plain service module template — module, service, constants, types, and unit test — for an existing NestJS project",
    inputs: defineInputs({
      name: z.string().describe("Module name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: withBaselines("modules", {
      patterns: ["src/modules/*"],
      tags: ["framework:nestjs"],
    }),
    name: "nestjs-service-module",
    templatePath: "configuration/conformetry-templates/nestjs-service-module",
  },
  // The extglob in each frontend source pattern keeps a test file from being
  // read as an instance named after itself. Instances are matched to whichever
  // template their files fit, not to the group that found them, so a route's
  // test is `.integration.test.tsx` and a component's `.unit.test.tsx` —
  // otherwise `index.tsx` would fit both templates equally and be held to both.
  // A React application holds every component and hook in a folder of its
  // own, the way a NestJS project holds every service in a module: the folder
  // generators write the folder with its types, constants, and utilities, and
  // the file generators add one more component or hook to a folder that
  // exists, the way `nestjs-service-file` adds a service to a module.
  {
    description:
      "A React component folder — the component, its types, constants, and utilities, and its unit test — in src/components of an existing React application",
    inputs: defineInputs({
      name: z.string().describe("Component name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: ["src/components/*"],
        tags: ["framework:react", "type:application"],
      },
    ],
    name: "react-component-folder",
    templatePath: "configuration/conformetry-templates/react-component-folder",
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
          "src/components/*/!(*.test).tsx",
          "src/components/*/*.unit.test.tsx",
        ],
        tags: ["framework:react", "type:application"],
      },
    ],
    name: "react-component-file",
    templatePath: "configuration/conformetry-templates/react-component-file",
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
    templatePath: "configuration/conformetry-templates/react-hook-folder",
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
    templatePath: "configuration/conformetry-templates/react-hook-file",
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
    instances: withBaselines("routes", {
      patterns: [
        "src/routes/!(__root|*.integration.test).tsx",
        "src/routes/*.integration.test.tsx",
      ],
      tags: ["framework:tanstack-start"],
    }),
    name: "tanstack-route",
    templatePath: "configuration/conformetry-templates/tanstack-route",
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
      "configuration/conformetry-templates/tanstack-server-function",
  },
];

export default conformetryConfiguration;
