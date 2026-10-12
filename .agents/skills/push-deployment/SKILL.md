---
name: push-deployment
description: "Carry reviewed open pull requests through CI, conflicts, the merge queue, release, and a check that the change works on main."
argument-hint: "PR number(s) or URL(s); defaults to the current branch's pull request"
disable-model-invocation: true
---

# Push Deployment

Take each open, implemented, reviewed pull request from "open" to "verified on `main`". A pull request is done when its change is **observed working on `main`**, not when it merges.

Work on one pull request at a time through steps 1–5. With several, order them by dependency: independent ones enter the queue in parallel. A pull request whose base is another branch belongs to a **stack**: read [stacked-pull-requests.md](references/stacked-pull-requests.md) before step 1, since stacks change steps 1–3. When a check, hook, or release run fails for a reason that is not obvious, read [known-failures.md](references/known-failures.md). Close with one table row per pull request: number, outcome, release (or "none expected"), validation evidence.

## Watching

Wait on the host's PR monitor (`mcp__ccd_pr__bind_pr`, `get_status`) when it exists; otherwise `gh run watch <id> --exit-status` in the background. Never sleep-poll.

Every wait is bounded. After **3 failed attempts at the same failure**, or when a step runs twice its workflow's `timeout-minutes`, stop and report.

## Preflight

Completion: each item below holds, or is fixed and noted. Read the pull request with `gh pr view <n> --json isDraft,title,body,labels,assignees,commits,reviewDecision`.

- **Ready for review**: `isDraft` is false. Continuous Integration skips drafts, so a draft shows no failures and no passes. `gh pr ready <n>` fixes it.
- **Metadata**: all four description headings (🌰 Summary, 📝 Details, 🧪 Testing, 🔗 Related) carry real content; one `type:*` label matching the title's type; `scope:*` labels exactly matching the title's scopes; one `source:*` label; an assignee. A mismatch is cleared with `gh pr edit`.
- **Title significance**: the title's type is at least as significant as the highest commit on the branch, because the squashed title alone decides the release.
- **Signatures**: every commit on the branch shows verified (`required_signatures` is a repository rule). Unsigned commits go through [sign-commits](../sign-commits/SKILL.md).
- **Approval**: `@JimmyPaolini` has approved, per [CODEOWNERS](../../../.github/CODEOWNERS). Without it, stop and report; never request, dismiss, or route around a review.

## 1. Green CI

Completion: `gh pr view <n> --json mergeable,mergeStateStatus` reports `MERGEABLE` and `CLEAN`, and all 11 required contexts have passed (Format, Typecheck, Secure, Test, Test Meanderaw, Test IC Suite, Guard, Build, Lint, Deprecate, Comply).

A check **count** proves nothing: a conflicting pull request runs no `pull_request` workflows, so a short green list means unvalidated. Confirm `MERGEABLE` first, then count the check **names**.

For each red check, diagnose with [triage-integration](../triage-integration/SKILL.md), then choose a tier:

| Tier                  | Examples                                                                                                                                                                                                                             | Action                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Fix and push**      | format/lint autofix; type error in a touched file; test or snapshot the change itself broke; stale generated report (callidescope, codependix, codometer); a file or function split within one project to meet a size or depth limit | Fix, run [validate-code](../validate-code/SKILL.md), commit with [commit-code](../commit-code/SKILL.md), push, resume watching |
| **Raise to the user** | moving, renaming, or adding modules; edits reaching a second project; dependency, lockfile, tsconfig, or limit changes; deleting or weakening a test; ADR-level or interface changes; a failure with no clear root cause             | Stop. Report the failing check, root cause, and a recommended fix                                                              |
| **Re-run**            | `sweph` native build "Permission denied"; runner timeout or cancellation with no code cause                                                                                                                                          | `gh run rerun <id> --failed`, once                                                                                             |

- A failing metadata check (`Validate Conventions`, `Comply`) is cleared by a fresh event, e.g. `gh pr edit --body-file` with a real change. A re-run replays the frozen payload and fails again.
- Fix root causes only. Suppression comments, loosened compiler options, lint ignores, raised limits, and `--no-verify` are all off the table.
- Every pushed fix gets a Conventional Commit and a signature. Mention each fix in the pull request thread so the reviewer sees what moved after approval; if a fix changes what the pull request does or its title's type, run [update-pull-request](../update-pull-request/SKILL.md).

## 2. Conflicts

Completion: `mergeable` is `MERGEABLE` after a push, and step 1's completion holds again.

Check `mergeable` after every push and whenever `main` moves. On `CONFLICTING`:

1. Merge `origin/main` into the branch (in a worktree session, the `mcp__ccd_host__sync_with_base_branch` tool). Merge rather than rebase: a rebase flattens merge commits and breaks signatures. A stack is the exception: it needs linear history, so use `gh stack sync` and `gh stack rebase` per [stacked-pull-requests.md](references/stacked-pull-requests.md). After merging, run `pnpm exec nx sync`: a changed conformetry configuration leaves the gitignored plugin stale.
2. Resolve by intent. Generated blocks (README codometer badges, callidescope and codependix reports) take either side, then regenerate with the matching `nx run <project>:<tool>:write`. Hand-written code that both sides changed is a **raise to the user** unless the two edits are independent lines.
3. `pnpm-lock.yaml`: never initialize the `applications/JimmyPaolini` submodule; revert its lockfile entry, then `pnpm install --frozen-lockfile`.
4. Run [validate-code](../validate-code/SKILL.md), commit, push, return to step 1.

## 3. Merge queue

Completion: the pull request's state is `MERGED`.

Enqueue once step 1 holds, an approval from `@JimmyPaolini` is on record, no `do-not-merge` label is present, and review threads are resolved:

```bash
gh pr merge <n> --squash --auto          # standalone pull request
gh stack merge <top-pr> --yes --squash   # stack: gh pr merge cannot merge one
```

Missing approval or an unresolved thread is a **raise to the user**; never route around it, and never pass `--admin`.

The queue re-runs the check workflows on a merge commit built from `main` plus the queued pull requests (`merge_group` events; minimum wait 6 minutes, response timeout 32). Watch with `gh run list --event merge_group` and `gh pr view <n> --json state,mergeStateStatus`.

A pull request ejected from the queue returns to step 1 with the failing `merge_group` run's logs: the failure is usually `main` having moved underneath it, so step 2 often applies. Re-enqueue after the fix.

## 4. Deploy and release

Completion: every artifact the pull request's type entitles it to exists, or the run shows why none was expected.

Merge to `main` starts 🦸 Continuous Deployment (`push-releases`, timeout 32 minutes) and 🧑‍🎤 Continuous Integration. Compute the **expected release** from the squashed title with the Release Significance table in [CONTRIBUTING.md](../../../.github/CONTRIBUTING.md#release-process): `docs`, `style`, `test`, `chore`, and `no-release` expect none.

A green run does not prove a release; read the `Releases` job's log and the artifacts. When a release is expected, confirm each of these:

| Artifact                      | Check                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| Codebase tag + GitHub release | `gh release list --limit 3`; a `chore(release): 🔖 tag codebase` commit on `main`                 |
| Package tags                  | `git fetch --tags`, then `<project>@<version>` for each IC-suite package the pull request touched |
| npm and GitHub Packages       | `npm view <package> version` matches the tag; the GitHub Packages copy exists                     |
| Post-release CI               | the CI run on the release commit passes                                                           |

Read outcomes this way:

- _"superseded by <sha>"_: a newer commit holds `main`'s tip and its run releases this change too. Watch that run.
- _cancelled at the job timeout_: no state was left behind. Re-run the workflow once, and report if it repeats.
- _any other failure_: **raise to the user** with the failing step, root cause, and a fix-forward versus revert recommendation. Never revert, force-push, hand-edit versions or changelogs, or tag by hand.

## 5. Validate on main

Completion: evidence, recorded in the report, that the change behaves as intended **on `main`'s merge commit**, not the branch.

Check out the merge commit (or install the published version) and run every check that applies:

- **Repro**: the scenario from the pull request's 🧪 Testing section or linked issue, which failed before and must pass now.
- **Published artifacts**: install each new version from a scratch directory _outside_ the workspace and import or run it. A workspace install proves nothing about the tarball.
- **Deployed environment**: when the change's scope deploys (`infrastructure/`, an application with a chart), read [infrastructure/AGENTS.md](../../../infrastructure/AGENTS.md) and confirm the rollout and the service's behavior.
- **Post-release `main`**: the CI run on the tip is green.

A check that cannot be run is reported as skipped with the reason, never as passed. A failed validation is a **raise to the user** with the evidence, and a proposed follow-up pull request.

## Closeout

Completion: nothing is left claiming the work is in flight. Run only after step 5 passes.

- **Issues**: for each issue the pull request closes or advances, remove `status:in-progress`, and `gh issue close <n> --comment "<pull request and release>"` the ones now done (a closed issue is the done signal; no `status:done` label exists). Close a parent spec only when every pull request under it is merged.
- **Branches**: `gh stack sync --prune` for a stack. Ask before removing a worktree or local branch.

## Report

End with the table, then list anything left undone and why.
