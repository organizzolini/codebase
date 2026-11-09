Commands that run in CI:
`publishable-packages-gate` (runs the publishable-packages check only when an
ic-suite package is affected) and the release steps `version-packages`, `tag-codebase`, `tag-packages`,
`publish-packages`, and `link-packages`. See
[AGENTS.md](AGENTS.md).

## Start

```bash
nx run publication:start
```

## Test

```bash
nx run publication:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run publication:coinagerie-check:write`.

- **baseline**: Starting version a package is measured from when no earlier tag exists, placed on the commit before it was added.
- **batch**: Group of six tags pushed together by tag-packages, with a rejected batch retried, so pushes respect the remote's limits.
- **breadth**: Callidescope limit on how many callees one frame may fan out to, set as maximumBreadth in the publication config.
- **mirror**: Publish step that copies each npm package to GitHub Packages as owner/project, exiting 1 when a mirror or input fails.
- **quiet**: Git flag --quiet passed to fetch and diff in the release steps, suppressing output so the run logs stay readable.
- **rehearsal**: Dry-run release mode where packages are not really published, and which is refused if any would reach a real registry.

<!-- coinagerie:end -->
