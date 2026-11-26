# documentation

Refreshes the repository documentation from code. Its one command, `refresh-documentation`, runs OpenWiki in the workspace root and writes the generated pages under `documentation/openwiki/`; the scheduled 🧑‍🏫 Refresh Documentation workflow runs it through `nx run documentation:refresh-documentation`.

## What it holds

- `openwiki/` — the generated pages, reached through the root `openwiki` symlink.
- `agents/` — the settings the vendored skills read: the issue tracker, handoffs, and OpenWiki.
- `documentation/` — the generated toolchain reports for callidescope, codependix, codometer, and coinagerie.

Plans and specs are issues and conventions are skills, so nothing else belongs here. Never hand-edit `openwiki/` or `documentation/documentation/`: change the source and let the next run regenerate them.

## Rate limits

A refresh makes up to 4 attempts. After a failure it waits the longer of its growing delay and the reset time OpenRouter reported, and it stops at once when that reset is more than 15 minutes away, as a daily limit is. Every attempt is listed in the job summary. See [`agents/openwiki.md`](agents/openwiki.md) for re-initializing the wiki, and `refresh-documentation.constants.ts` for the numbers.
