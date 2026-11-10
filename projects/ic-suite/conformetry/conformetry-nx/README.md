# 👔 Conformetry Nx

[![npm](https://img.shields.io/npm/v/@conformetry/nx?logo=npm&label=npm)](https://www.npmjs.com/package/@conformetry/nx)

The Nx host for [Conformetry](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/conformetry/conformetry-cli#readme).
Canonical documentation for command behavior, configuration, template syntax, scoring, and validators is in the
[@conformetry/cli README](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/conformetry/conformetry-cli#readme).
This package adds two things the standalone CLI cannot offer: generators addressed by name through `nx g`,
and a cached validation target inferred onto every project that holds
instances.

```bash
npm install --save-dev @conformetry/nx
```

## Setup

Register the plugin in `nx.json` and wire the bootstrap into `postinstall`:

```json
{
  "plugins": [
    {
      "plugin": "@conformetry/nx",
      "options": {
        "configurationPath": "configuration/conformetry.config.ts",
        "validateTargetName": "conformetry-validate"
      }
    }
  ],
  "sync": { "globalGenerators": ["@conformetry/nx:sync"] }
}
```

```json
{ "scripts": { "postinstall": "conformetry-nx-bootstrap-generators" } }
```

The `configurationPath` option is **required**: no default file is assumed and
no filename is searched for. A plugin entry without it fails with a
`ConfigurationPathRequiredError` from `@conformetry/configuration` naming the
option, and so does the bootstrap, which reads it from `nx.json`. The executor
and the `sync` generator take the same path as a `configuration` option, which
wins over the registration when both are set.

Then type your configuration as `ConformetryNxConfiguration` rather than
`ConformetryConfiguration`, so instance groups are checked against what Nx can
actually resolve:

```ts
import { type ConformetryNxConfiguration } from "@conformetry/nx";
```

## The emitted plugin

Which generators a workspace has is a property of its conformetry
configuration, so the plugin exposing them is **emitted rather than written**.
`conformetry-nx-bootstrap-generators` derives it from your configuration,
writes it to `.conformetry/nx-generators` (gitignore that directory — it is a
build artifact), and links it into the root `node_modules` so
`nx g conformetry:<generator>` resolves. The link is what makes the plugin
addressable, since Nx resolves a generator's package prefix by requiring it by
name rather than by matching an Nx project.

| Default | Value |
| ------- | ----- |
| Output path | `.conformetry/nx-generators` |
| Package name | `conformetry` — so generators are `nx g conformetry:<name>` |

The bootstrap warns rather than exiting non-zero when the configuration cannot
be read, so a configuration mid-edit never blocks an unrelated install. Drift
is caught where it matters instead: every conformetry command compares the
emitted plugin against the configuration and refuses to run against a stale
one.

`@conformetry/nx` deliberately declares no generators of its own beyond `sync`.
`nx g @conformetry/nx:anything` resolves nothing by design — which generators
exist is a property of your configuration, not of this package.

`sync` runs both ways: `nx sync` and `nx sync:check` use it as the global sync
generator, and `nx g @conformetry/nx:sync` runs it directly, writing the
emitted plugin.

## Generating

```bash
nx g conformetry:nestjs-service-module --name=billing --project=lexico
```

Nx prompts for missing inputs from the generator's own schema and writes
through its virtual `Tree`, so `--dry-run` works and the workspace formatter
runs over the result.

## Validating

The plugin infers a `conformetry-validate` target onto every project holding
instances, so validation is cached and participates in `nx affected`:

```bash
nx run <project>:conformetry-validate
nx run-many --target=conformetry-validate --all
nx affected --target=conformetry-validate --base=main
```

| Executor option | Purpose |
| --------------- | ------- |
| `configuration` | Configuration file, workspace-root relative. Taken from the `configurationPath` plugin option in `nx.json` when omitted; one of the two is required |
| `languages` | Restrict the run to named validators; all run when omitted |

## Tag-scoped instances

The Nx host reads an instance group's `tags` as project tags, and resolves that
group's globs _inside_ each matching project — so where a generator belongs is
stated exactly once:

```ts
instances: [{ patterns: ["src/modules/*"], tags: ["framework:nestjs"] }];
```

A project must carry **every** tag a group names, so a second tag narrows the
group further — `tags: ["framework:nestjs", "language:graphql"]` reaches only
NestJS projects that are also GraphQL.

The two group forms are told apart by `tags` alone. There is no second field
that could disagree with it: a separate scope that excluded a project the globs
reached narrowed validation silently, and validation cannot notice instances
it was never offered.

Omitting `patterns` selects the projects without locating anything in them,
which is what a template with no instances yet wants — `nx g` is still confined
to the projects the template suits.

## Exports

`runConformetryGenerator` for generator wrappers, `bootstrapPlugin` and
`runBootstrapCli` for the bootstrap, the `ConformetryNxConfiguration` and
instance-group types, and the NestJS services behind them (`PluginService`,
`AdapterService`, `InstancesService`, `ScopeService`, `OptionsService`).

## Test

```bash
nx run conformetry-nx:vitest
```

## License

MIT — see [LICENSE](../../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.
