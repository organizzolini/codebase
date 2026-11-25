# conformetry-configuration

Configuration reader, schema validation, and template discovery for Conformetry. It depends on `@conformetry/core`.

## Modules

- `configuration/` — The single entry point for configuration questions: load a config file, find templates and instances, and prompt for inputs (`ConfigurationService`).
- `input/` — Parses command-line options into generator inputs (`InputOptionsService`).
- `instance-discovery/` — Expands instance glob patterns into instances (`InstanceDiscoveryLocatingService`).
- `instance-group/` — Reads an instance group's own fields, for every host that resolves one (`InstanceGroupService`).
- `rendering/` — Renders conformetry template placeholders (`RenderingService`).
- `template-discovery/` — Reads template folders and maps their files onto instance files (`TemplateDiscoveryService`).
