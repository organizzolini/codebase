# ⚙️ Configuration resolution, field by field

Every configuration field, resolved by the real loader — including the two a reader is most likely to assume wrongly.

## Run it

```bash
nx run codependix-examples:examples
```

Everything below is rendered from the subject in this directory by the real
graph builders, so a claim that stops being true fails a check rather than
misleading anybody. The command above fails if what is committed here has
drifted; `:write` regenerates it.

## A project's own file, an included project with no file, and the two glob lists

`atlas-core` carries its own `codependix.config.ts` — see the next section for how it spreads `projectDefaults` — and is read exactly as loaded, with no further merge. `atlas-service` names no file of its own, and resolves to `"none"` even though `include` matches it: a project matched by `include` with no file of its own produces no per-project output. `atlas-application` matches `exclude`, so it resolves to `"none"` no matter what its own file would otherwise say. `unrelated` matches no `include` glob at all.

| Project | Own file? | Resolved target | Destination |
| ------- | --------- | --------------- | ----------- |
| `atlas-core` | yes | `json` | json `codependix-nx-graph.json` |
| `atlas-service` | no | `none` | _none_ |
| `atlas-application` | no | `none` | _none_ |
| `unrelated` | no | `none` | _none_ |

## `projectDefaults`, spread and then overridden

`examples/configuration-resolution/per-project-files/codependix.config.ts` exports `projectDefaults`. Its `packages/atlas-core/codependix.config.ts` spreads it and overrides `nxProjects` outright — the spread's `markdown` destination is gone, not merged with the `json` one that replaced it. `packages/atlas-service/` carries no `codependix.config.ts` at all, so `loadProjectConfiguration` resolves it to `undefined` rather than falling back to `projectDefaults` on its own — a project opts in by writing the file.

```json
{
  "atlasCore": {
    "nxProjects": {
      "json": {
        "path": "codependix-nx-graph.json"
      },
      "target": "json"
    }
  },
  "atlasService": null
}
```

## `include` and `exclude` match a name or a root

Both lists are matched against a project's name **and** its workspace-relative root. `atlas-service` matches no glob by name and matches `packages/*` by root, so a caller that knows the root gets a different answer from one that does not — which is why `projectRoot` is optional rather than absent.

```text
include: ["packages/*", "codependix-*"]

atlas-service, name only                        → false
atlas-service, name and packages/atlas-service  → true
codependix-examples, name only                  → true
```

## The Workspace Graph ignores both glob lists

It is exported once for the repository rather than once per project, so it carries no per-project override and `include`/`exclude` never apply to it. `--projects` and `--tags` are the exception: they narrow which projects are **nodes** in it, while its destination is still read from `workspace.nxProjects`.

```json
{
  "markdown": {
    "anchor": "example-workspace",
    "path": "README.md"
  },
  "target": "markdown"
}
```

## The path names the file; a neighbor is never read

`examples/configuration-resolution/precedence/` holds both a `codependix.config.ts` and a `codependix.config.json`. `--config` names exactly one, and that is the only one read — the anchor each declares differs, so loading either by name shows which file answered. Nothing is searched for: no default filename, no walk upward, and no absent file is read as an empty configuration. A project's own `codependix.config.ts` is the exception — see the next section — found beside the project root, never upward.

```json
{
  "codependix.config.json": {
    "nxProjects": {
      "markdown": {
        "anchor": "example-nx-from-json"
      },
      "target": "markdown"
    }
  },
  "codependix.config.ts": {
    "nxProjects": {
      "markdown": {
        "anchor": "example-nx"
      },
      "target": "markdown"
    }
  }
}
```

## An unknown field is stripped, not rejected

The configuration declares a `graphqlSchemas` field no codependix has an opinion about. Zod strips unknown keys, so a configuration written for a newer codependix still loads under an older one.

```json
{
  "nxProjects": {
    "markdown": {
      "anchor": "example-nx"
    },
    "target": "markdown"
  }
}
```

## Next

[export-targets](../export-targets/README.md).
