# documentation

Refreshes the repository documentation from code. Its one command, `refresh-documentation`, runs OpenWiki in the workspace root and writes the generated pages under `documentation/openwiki/`; the scheduled 🧑‍🏫 Refresh Documentation workflow runs it through `nx run documentation:refresh-documentation`. Never hand-edit the generated pages: change the source and let the next run regenerate them. Re-initializing OpenWiki is the exception, covered in `documentation/agents/openwiki.md`.

## Contents

The project's code is the `refresh-documentation` command under `src/modules/`. The folder around it is the repository's hand-written documentation:

- `agents/` — the per-repository configuration the vendored skills read: the issue tracker, handoffs, and OpenWiki.
- `development/` — guides for developing the toolchains, such as the callidescope configuration and the examples-package standard.
- `documentation/` — the reference pages for callidescope, codependix, codometer, and coinagerie.
- `planning/` and `research/` — dated notes. They record what was true when written and are not kept in step with the code.
- `openwiki/` — the generated pages, reached through the root `openwiki` symlink.
