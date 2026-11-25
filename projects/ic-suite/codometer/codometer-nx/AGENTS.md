# codometer-nx

Nx plugin that infers a codometer-limit and a codometer-weigh target for every project with a codometer configuration. It depends on `@codometer/configuration`.

## Modules

- `options/` — Narrows the unvalidated options object Nx hands a plugin from `nx.json` (`OptionsService`).
- `plugin/` — Everything this plugin does, behind one injectable (`PluginService`).
