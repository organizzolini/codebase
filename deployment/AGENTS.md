# deployment

**Purpose**: The release pipeline of Continuous Deployment as tested commands. The Nx task-cache and affected-run steps live in the `integration` project. Commands only compute and print and set an exit code; services hold the logic behind injected file-system and process wrappers.

## Commands

Commands read their inputs from the environment, as the workflows and composite
actions set them, print what they decide, and set the exit code. Anything that
runs a child process goes through `ProcessRunnerService`, so a test replaces
one class.

| Command            | Module                         | Called from                                                            |
| ------------------ | ------------------------------ | ---------------------------------------------------------------------- |
| `version-packages` | `src/modules/version-packages` | 🏷️ Version Packages in Continuous Deployment                           |
| `tag-codebase`     | `src/modules/tag-codebase`     | 🔖 Tag Codebase in Continuous Deployment                               |
| `tag-packages`     | `src/modules/tag-packages`     | 🔖 Tag Packages in Continuous Deployment, and `version-packages` first |
| `publish-packages` | `src/modules/publish-packages` | 📦 Publish Packages in Continuous Deployment                           |
| `link-packages`    | `src/modules/link-packages`    | 🔗 Link Packages in Continuous Deployment                              |

`src/modules/process-runner` holds the shared wrapper over `node:child_process`
(`capture` returns the output, `captureAsync` does so without blocking, and
`stream` inherits it, and `captureToFile` writes it to a file byte for byte).
`src/modules/release-group` reads the Nx release
group and runs registry calls six at a time; `src/modules/main-tip` notices when
`main` moved during a release run and sets `RELEASE_SUPERSEDED`, which every
later release step skips on.

### Release Steps

The release job of `.github/workflows/continuous-deployment.yml` runs the
release commands in the table's order, with semantic-release (`tag-codebase`)
between versioning and tagging: its release commit carries both the codebase's
version and the packages' versions, so a release adds one commit to `main`.
[`documentation/release-process.md`](documentation/release-process.md) describes each step.

All are safe to re-run: Nx versions only what changed since each package's
last tag, tagging skips a tag that exists, pnpm skips a version npm already has,
and so does the mirror for GitHub Packages and the link for a tarball with a
storage record.

Setting `NPM_REGISTRY` to anything but npmjs.org makes a run a rehearsal:
`publish-packages` drops `--provenance` and refuses to start while
`GITHUB_PACKAGES_REGISTRY` still names GitHub or any group package keeps a
`publishConfig.registry` of its own (which beats `--registry`), and
`link-packages` lists the tarballs to attest but makes no `gh api` call. A
rehearsal against the local Verdaccio registry (`configuration:local-registry`)
still needs a scratch `HOME` and npm user config, since the publish
step appends its tokens to `~/.npmrc`; follow the `publish-release` skill's
rehearsal guide, and version the packages plainly rather than as prereleases,
which `npm publish` refuses to mirror without a tag.

Unlike the `integration` commands, the release services print as they go rather than
returning a result for the command to print: they replace shell steps whose
log is read live in CI, and the registry steps print each package's lines
whole, in order, as its parallel call finishes.

Run one locally with `nx run deployment:start:<command>`, setting the
variables it reads (`TARGET`, `NX_BASE`, `NX_HEAD`, and so on).

A command needs the installed dependencies, so a step that must run before the
install cannot live here. The Nx steps that run right after the install are the
`integration` project's.
