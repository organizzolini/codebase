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
 * Code the shadcn CLI writes, which is vendored rather than authored here: each
 * directory is one of the aliases a project's `components.json` hands the CLI.
 * Holding it to a template would mean editing files the next `shadcn add`
 * overwrites, so every frontend instance group leaves it out of validation.
 */
const SHADCN_GENERATED_PATTERNS = [
  "projects/common/presentation/src/components/examples/**",
  "projects/common/presentation/src/components/reui/**",
  "projects/common/presentation/src/components/ui/**",
  "projects/common/presentation/src/hooks/**",
  "projects/common/presentation/src/lib/**",
];

/**
 * A project's baseline per kind of instance: the project itself, its
 * `src/modules/*` directories, and its resolver, route, and service files. The
 * module directories are one kind whichever module template fits them, since
 * the first group to locate a path sets its threshold.
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
const COMMAND_PROJECT_BASELINE = 769 / 772;
const CLI_BASELINE = {
  application: COMMAND_PROJECT_BASELINE,
  modules: 149 / 187,
};
const WEB_BASELINE = { application: 716 / 738, routes: 131 / 145 };

/**
 * Each project's measured conformance score, written as requirements met over
 * requirements weighed, from when the test templates moved onto
 * `@codebase/testing` (#329). A kind holds the lowest score among the
 * project's instances of it, so validation passes before its tests migrate.
 * A project's migration deletes its entry, which raises it back to 1, and the
 * last migration deletes the table.
 */
const TEST_TEMPLATE_BASELINES: Record<string, TestTemplateBaseline> = {
  documentation: NEST_BASELINE,
  installation: NEST_BASELINE,
  integration: NEST_BASELINE,
  "projects/caelundas/caelundas-cli": NEST_BASELINE,
  "projects/caelundas/caelundas-web": WEB_BASELINE,
  "projects/common/persistence": NEST_BASELINE,
  "projects/ic-suite/callidescope/callidescope-cli": {
    ...NEST_BASELINE,
    application: COMMAND_PROJECT_BASELINE,
  },
  "projects/ic-suite/callidescope/callidescope-configuration": NEST_BASELINE,
  "projects/ic-suite/callidescope/callidescope-core": NEST_BASELINE,
  "projects/ic-suite/callidescope/callidescope-graph": NEST_BASELINE,
  "projects/ic-suite/callidescope/callidescope-nx": NEST_BASELINE,
  "projects/ic-suite/callidescope/callidescope-output": NEST_BASELINE,
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
  "projects/lexico/lexico-web": { application: 717 / 738, routes: 131 / 145 },
  "projects/meanderaw/meanderaw-cli": NEST_BASELINE,
  "projects/meanderaw/meanderaw-web": WEB_BASELINE,
  publication: NEST_BASELINE,
  synchronization: NEST_BASELINE,
  validation: NEST_BASELINE,
};

/**
 * Splits one generator's instance group into a group per project in
 * `TEST_TEMPLATE_BASELINES`, each held to that project's measured score. Listed
 * ahead of the tagged group they are cut from, they locate those projects'
 * instances first, which is what makes their threshold the one that applies.
 */
function baselineGroups(
  kind: keyof TestTemplateBaseline,
  patterns: string[],
): ConformetryNxInstanceGroup[] {
  return Object.entries(TEST_TEMPLATE_BASELINES).flatMap(
    ([projectRoot, baseline]) => {
      const threshold = baseline[kind];

      if (threshold === undefined) {
        return [];
      }

      return [
        {
          patterns: patterns.map((pattern) => {
            return path.posix.join(projectRoot, pattern);
          }),
          threshold,
        },
      ];
    },
  );
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
        threshold: COMMAND_PROJECT_BASELINE,
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
    instances: [
      ...baselineGroups("application", ["."]),
      {
        // The `node_modules` links would otherwise be followed back to the
        // packages they point at.
        exclude: ["projects/**/node_modules/**"],
        patterns: ["projects/**/*-web"],
      },
    ],
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
    instances: [
      ...baselineGroups("modules", ["src/modules/*"]),
      { patterns: ["src/modules/*"], tags: ["framework:nest-commander"] },
    ],
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
    instances: [
      ...baselineGroups("modules", ["src/modules/*"]),
      {
        patterns: ["src/modules/*"],
        tags: ["framework:nestjs", "language:graphql"],
      },
    ],
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
    instances: [
      ...baselineGroups("modules", ["src/modules/*"]),
      {
        patterns: ["src/modules/*"],
        tags: ["framework:nestjs", "language:graphql"],
      },
    ],
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
    instances: [
      ...baselineGroups("services", [
        "src/modules/*/*.service.ts",
        "src/modules/*/*.service.unit.test.ts",
      ]),
      {
        patterns: [
          "src/modules/*/*.service.ts",
          "src/modules/*/*.service.unit.test.ts",
        ],
        tags: ["framework:nestjs"],
      },
    ],
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
    instances: [
      ...baselineGroups("resolvers", [
        "src/modules/*/*.resolver.ts",
        "src/modules/*/*.resolver.unit.test.ts",
      ]),
      {
        patterns: [
          "src/modules/*/*.resolver.ts",
          "src/modules/*/*.resolver.unit.test.ts",
        ],
        tags: ["framework:nestjs", "language:graphql"],
      },
    ],
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
    instances: [
      ...baselineGroups("modules", ["src/modules/*"]),
      { patterns: ["src/modules/*"], tags: ["framework:nestjs"] },
    ],
    name: "nestjs-service-module",
    templatePath: "configuration/conformetry-templates/nestjs-service-module",
  },
  // The extglob in each frontend source pattern keeps a test file from being
  // read as an instance named after itself. Instances are matched to whichever
  // template their files fit, not to the group that found them, so a route's
  // test is `.integration.test.tsx` and a component's `.unit.test.tsx` —
  // otherwise `index.tsx` would fit both templates equally and be held to both.
  {
    description:
      "A React component and unit test file template for an existing React project, placed in src/components",
    inputs: defineInputs({
      name: z.string().describe("Component name in kebab-case"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: [
          "src/components/!(*.unit.test).tsx",
          "src/components/*.unit.test.tsx",
        ],
        exclude: SHADCN_GENERATED_PATTERNS,
        tags: ["framework:react"],
      },
    ],
    name: "react-component",
    templatePath: "configuration/conformetry-templates/react-component",
  },
  {
    description:
      "A React hook and unit test file template for an existing React project, placed in src/hooks",
    inputs: defineInputs({
      name: z
        .string()
        .regex(/^use-[a-z0-9-]+$/u)
        .describe("Hook name in kebab-case, starting with use-"),
      project: z.string().describe("Parent project name in kebab-case"),
    }),
    instances: [
      {
        patterns: [
          "src/hooks/use-!(*.unit.test).ts",
          "src/hooks/use-*.unit.test.ts",
        ],
        exclude: SHADCN_GENERATED_PATTERNS,
        tags: ["framework:react"],
      },
    ],
    name: "react-hook",
    templatePath: "configuration/conformetry-templates/react-hook",
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
      ...baselineGroups("routes", [
        "src/routes/!(__root|*.integration.test).tsx",
        "src/routes/*.integration.test.tsx",
      ]),
      {
        patterns: [
          "src/routes/!(__root|*.integration.test).tsx",
          "src/routes/*.integration.test.tsx",
        ],
        tags: ["framework:tanstack-start"],
      },
    ],
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
