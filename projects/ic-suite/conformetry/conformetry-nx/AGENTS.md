# conformetry-nx

Nx plugin providing dynamic generator scaffolding and conformance verification targets for Conformetry. It depends on `@conformetry/configuration`, `@conformetry/generation`, `@conformetry/output`, `@conformetry/validation`.

## Modules

- `adapter/` — Backs generation with an Nx `Tree` instead of the filesystem (`AdapterService`).
- `generator/` — Derives an Nx generator plugin from the conformetry configuration (`GeneratorService`).
- `instances/` — Turns Nx project knowledge into the instances conformetry validates (`InstancesService`).
- `options/` — Narrows the untyped options object Nx hands a plugin (`OptionsService`).
- `paths/` — Decides where a generator writes, by reading the workspace it writes into (`PathsService`).
- `plugin/` — The plugin's whole surface: infer targets, generate, validate (`PluginService`).
- `projects/` — Reads the workspace's projects straight from their `project.json` files (`ProjectsService`).
- `scope/` — Reads an instance group as Nx resolves it (`ScopeService`).
