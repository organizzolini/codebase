# documentation

Refreshes the repository documentation from code. Its one command, `refresh-documentation`, runs OpenWiki in the workspace root and writes the generated pages under `documentation/openwiki/`; the scheduled 🧑‍🏫 Refresh Documentation workflow runs it through `nx run documentation:refresh-documentation`.

## What it holds

- `openwiki/` — the generated pages, reached through the root `openwiki` symlink.
- `agents/` — the settings the vendored skills read: the issue tracker, handoffs, and OpenWiki.
- `documentation/` — the generated toolchain reports for callidescope, codependix, codometer, and coinagerie.
- `codebase/` — the whole repository's callidescope, codependix, and codometer reports.

Plans and specs are issues and conventions are skills, so nothing else belongs here. Never hand-edit `openwiki/`, `codebase/`, or `documentation/documentation/`: change the source and let the next run regenerate them.

## Rate limits and skipped pages

A refresh makes up to 4 attempts. After a failure it waits the longer of its growing delay and the reset time OpenRouter reported, and it stops at once when that reset is more than 15 minutes away, as a daily limit is. OpenWiki exits cleanly even when a page's worker ends without submitting, so a clean run that skipped pages is run again too: each retry resumes the skipped pages. The job fails only when no page was refreshed. Every attempt, with its skipped pages, and the refreshed and total page counts are listed in the job summary and the pull request. See [`agents/openwiki.md`](agents/openwiki.md) for re-initializing the wiki, and `refresh-documentation.constants.ts` for the numbers.
