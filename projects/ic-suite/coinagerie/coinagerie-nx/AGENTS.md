# coinagerie-nx

Nx plugin that infers a coinagerie check target for every project with a coinagerie configuration. It depends on `@coinagerie/configuration`.

## Modules

- `options/` — Narrows the unvalidated options object Nx hands a plugin from `nx.json` (`OptionsService`).
- `plugin/` — Everything this plugin does, behind one injectable (`PluginService`).
