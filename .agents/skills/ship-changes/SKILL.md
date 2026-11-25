---
name: ship-changes
description: "Carry a reviewed pull request through CI, conflicts, the merge queue, and release, then confirm it works on main. Use when the user asks to ship, merge, land, or babysit a pull request, or when one needs green CI or a conflict resolved to merge."
argument-hint: "PR number(s) or URL(s); defaults to the current branch's pull request"
---

# Ship Changes

Begin where [submit-changes](../submit-changes/SKILL.md) ends, and only when the user asked to ship or the task said to: merging is their call. Take each open, implemented, reviewed pull request from "open" to "verified on `main`". A pull request is done when its change is **observed working on `main`**, not when it merges.

Work on one pull request at a time through steps 1–5. With several, order them by dependency: independent ones enter the queue in parallel. A pull request whose base is another branch belongs to a **stack**: read [stacked-pull-requests.md](references/stacked-pull-requests.md) before step 1, since stacks change steps 1–3. When a check, hook, or release run fails for a reason that is not obvious, read [known-failures.md](references/known-failures.md).

## Watching

Never end a turn on an unarmed wait. A wait is armed when something will wake this session: the host's PR monitor (`mcp__ccd_pr__bind_pr`, `get_status`) when it exists, `subscribe_pr_activity` on the pull request, or a background watcher from [waiting.md](references/waiting.md), which exits on merged, closed, conflicting, or failed. A scheduled check-in alone is not armed, because the session can be archived before it fires, and the closeout then never runs. Never poll in the foreground.

When woken, resume at the step you were on, not at the top. When a step finishes, start the next in the same turn: a green run is a reason to enqueue, not to stop and report.

**A state that only needs time is a wait, never a question to the user.** Pending checks after a push or re-run, a running queue or release, a review not yet given, and an unresolved thread all resolve on their own, so never end a turn asking the user to say when to continue or to approve the next step. In the same turn as every push, re-run, or enqueue, start the [waiting.md](references/waiting.md) watcher in the background (`WATCH_GREEN=1` until the pull request is queued) and keep `subscribe_pr_activity` armed beside it, since a subscription alone can miss an event. Add a `send_later` check-in about 50 minutes out as a safety net on top of both, never in place of them. On every wake, re-read the pull request and carry on to the next step.

Every wait is bounded. After **3 failed attempts at the same failure**, or when a step runs twice its workflow's `timeout-minutes`, stop and report.

Where `gh` is unavailable, the GitHub MCP tools cover the same calls: `pull_request_read`, `update_pull_request`, `enable_pr_auto_merge`, `update_pull_request_branch`, and `get_job_logs`.

## Preflight

Completion: each item below holds, or is fixed and noted. Read the pull request through [repo-scoped REST](../../../documentation/agents/issue-tracker.md#repo-scoped-rest-instead-of-graphql), never `gh pr view`, which runs GraphQL: `gh api repos/{owner}/{repo}/pulls/<n>` for `draft`, `title`, `body`, `labels`, `assignees` and `mergeable_state`, `…/pulls/<n>/commits` for its commits, and `…/pulls/<n>/reviews` for reviews.

- **Ready for review**: `draft` is false. Continuous Integration skips drafts, so a draft shows no failures and no passes. Fix with `gh api -X POST repos/{owner}/{repo}/pulls/<n>/ccr/ready_for_review` in a Claude Code session, or `gh pr ready <n>` elsewhere.
- **Metadata**: all four description headings (🌰 Summary, 📝 Details, 🧪 Testing, 🔗 Related) carry real content; one `type:*` label matching the title's type; `scope:*` labels exactly matching the title's scopes; one `source:*` label; an assignee. Fix with `gh api -X PATCH repos/{owner}/{repo}/pulls/<n>` for the title and body, and `gh api -X POST repos/{owner}/{repo}/issues/<n>/labels` or `…/assignees` for labels and assignees.
- **Title significance**: the title's type is at least as significant as the highest commit on the branch, because the squashed title alone decides the release.
- **Signatures**: every commit reads `verified: true` from the API (`gh api repos/<owner>/<repo>/pulls/<n>/commits --jq '.[].commit.verification.verified'`), since `required_signatures` is a repository rule. Local `git log %G?` is unreliable without the signer's public key. Unsigned commits go through [sign-commits](../sign-commits/SKILL.md).
- **Review**: [CODEOWNERS](../../../.github/CODEOWNERS) names `@JimmyPaolini` as sole owner, and GitHub asks no one to approve a pull request its sole owner authored, so an empty `reviewDecision` is fine for their own. For another author, an approval from `@JimmyPaolini` must be on record, or [wait](#watching) for it. Never request, dismiss, or route around a review.

## 1. Green CI

Completion: `gh api repos/{owner}/{repo}/pulls/<n> --jq '[.mergeable, .mergeable_state]'` prints `[true,"clean"]`, and every required context has passed. Read the list from the ruleset, because it grows and gets renamed (19 on 2026-11-23): `gh api repos/{owner}/{repo}/rules/branches/main --jq '.[] | select(.type=="required_status_checks") | .parameters.required_status_checks[].context'`.

A check **count** proves nothing: a conflicting pull request runs no `pull_request` workflows, so a short green list means unvalidated. Confirm `MERGEABLE` first, then match the check **names** against that list.

For each red check, diagnose with [triage-integration](../triage-integration/SKILL.md), then choose a tier:

| Tier                  | Examples                                                                                                                                                                                                                             | Action                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Fix and push**      | format/lint autofix; type error in a touched file; test or snapshot the change itself broke; stale generated report (callidescope, codependix, codometer); a file or function split within one project to meet a size or depth limit | Fix, run [validate-code](../validate-code/SKILL.md), commit with [commit-code](../commit-code/SKILL.md), push, resume watching |
| **Raise to the user** | moving, renaming, or adding modules; edits reaching a second project; dependency, lockfile, tsconfig, or limit changes; deleting or weakening a test; architectural or interface changes; a failure with no clear root cause         | Stop. Report the failing check, root cause, and a recommended fix                                                              |
| **Re-run**            | a flaky cause listed in [known-failures.md](references/known-failures.md), or a runner timeout or cancellation with no code cause                                                                                                    | `gh run rerun <id> --failed`, once                                                                                             |

- **Red that is not yours**: before choosing a tier, reproduce the failing check on `origin/main` (a scratch checkout, deleted after). If it fails there too, the pull request did not cause it: a project that was never gated, or a gate that just became required, is the usual source. When the fix is mechanical (shortening over-budget comments, splitting an over-full folder, regenerating a stale report) and stays inside one project, do not ask. Open a separate fix pull request from `main` with [submit-changes](../submit-changes/SKILL.md), ship it through this skill first, then merge `main` into the original and resume step 1. Raise it only when the fix needs a design choice, or touches limits, dependencies, or interfaces, and include the `origin/main` reproduction.
- A failing metadata check (`Comply`) needs a fresh event, not a re-run, which replays the frozen payload.
- Fix root causes only. Suppression comments, loosened compiler options, lint ignores, raised limits, and `--no-verify` are all off the table.
- Every pushed fix gets a Conventional Commit and a signature. Mention each fix in the pull request thread so the reviewer sees what moved after approval; if a fix changes what the pull request does or its title's type, update it with [create-pull-request](../create-pull-request/SKILL.md#update-an-existing-pull-request).

## 2. Conflicts

Completion: `mergeable` is `MERGEABLE` after a push, and step 1's completion holds again.

Check `mergeable` after every push and whenever `main` moves. On `CONFLICTING`:

1. Merge `origin/main` into the branch (in a worktree session, the `mcp__ccd_host__sync_with_base_branch` tool), then run `pnpm exec nx sync`. Merge rather than rebase: a rebase flattens merge commits and breaks signatures. A stack is the exception: it needs linear history, so follow [stacked-pull-requests.md](references/stacked-pull-requests.md).
2. Resolve by intent. Generated blocks (README codometer badges, callidescope and codependix reports) take either side, then regenerate with the matching `nx run <project>:<tool>:write`. For hand-written text both sides changed, read both sides' commit messages and keep both intents; this covers prose, skills, docs, and configuration, and code whose two edits are independent lines or whose intents are both stated. Verify with [validate-code](../validate-code/SKILL.md) and the affected tests. It is a **raise to the user** only when the intents contradict, are not recoverable from the history, or the checks fail after resolving.
3. `pnpm-lock.yaml`: never initialize the `projects/JimmyPaolini` submodule; revert its lockfile entry, then `pnpm install --frozen-lockfile`.
4. Merges that apply cleanly can still contradict: search `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, and the skills for statements about the rule the pull request changes, and align them in the same pull request.
5. Run [validate-code](../validate-code/SKILL.md), commit, push, return to step 1.

## 3. Merge queue

Completion: the pull request's state is `MERGED`.

Enqueue once step 1 holds, the Preflight review condition holds, no `do-not-merge` label is present, and review threads are resolved. Finish every fix first: any push after enqueueing ejects the pull request. Once queued, the branch is locked: `disable_pr_auto_merge` does not dequeue, REST and MCP have no dequeue call, and a push is rejected (GH006). A fix that turns up after enqueueing therefore ships as a follow-up pull request once this one merges, without asking.

```bash
gh api -X PUT repos/{owner}/{repo}/pulls/<n>/ccr/auto_merge -f merge_method=squash   # standalone pull request, Claude Code session
gh pr merge <n> --squash --auto          # standalone pull request, anywhere else
gh stack merge <top-pr> --yes --squash   # stack: gh pr merge cannot merge one
```

A missing required review or an unresolved thread is a **wait**, not a stop: say once on the pull request's thread what it is waiting on, arm the [Watching](#watching) wait, and enqueue on the wake that finds it cleared. Never route around it, and never pass `--admin`. Stop and report only when the wait hits its bound.

The queue re-runs the check workflows on a merge commit built from `main` plus the queued pull requests (`merge_group` events; minimum wait 6 minutes, response timeout 32). Watch with `gh run list --event merge_group` and `gh api repos/{owner}/{repo}/pulls/<n> --jq '[.state, .merged]'`. A queued pull request reports no `auto_merge`, so judge it by that state and the queue run, not by `auto_merge`. A pull request ejected from the queue returns to step 1 with the failing run's logs; usually `main` moved, so step 2 applies. If the failing project is one the pull request never touched, see "Red that is not yours" in step 1. Re-enqueue after the fix.

## 4. Deploy and release

Completion: every artifact the pull request's type entitles it to exists, or the run shows why none was expected.

Merge to `main` starts 🦸 Continuous Deployment (`push-releases`, timeout 32 minutes) and 🧑‍🎤 Continuous Integration. Compute the **expected release** from the squashed title with the Release Significance table in [CONTRIBUTING.md](../../../.github/CONTRIBUTING.md#release-process): `docs`, `style`, `test`, `chore`, and `no-release` expect none.

A green run does not prove a release; read the `Releases` job's log and the artifacts. When a release is expected, confirm each of these:

| Artifact                      | Check                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Codebase tag + GitHub release | `gh api repos/{owner}/{repo}/releases/latest --jq .tag_name`; a `chore(release): 🔖 tag codebase` commit on `main` |
| Package tags                  | `git fetch --tags`, then `<project>@<version>` for each IC-suite package the pull request touched                  |
| npm and GitHub Packages       | `npm view <package> version` matches the tag; the GitHub Packages copy exists                                      |

A superseded or timed-out `Releases` job has a known read and action under "Merge and release" in [known-failures.md](references/known-failures.md). Any other failure is a **raise to the user** with the failing step, root cause, and a fix-forward versus revert recommendation. Never revert, force-push, hand-edit versions or changelogs, or tag by hand.

## 5. Validate on main

Completion: evidence, recorded in the report, that the change behaves as intended **on `main`'s merge commit**, not the branch.

Check out the merge commit (or install the published version) and run every check that applies:

- **Repro**: the scenario from the pull request's 🧪 Testing section or linked issue, which failed before and must pass now.
- **Published artifacts**: install each new version from a scratch directory _outside_ the workspace and import or run it. A workspace install proves nothing about the tarball.
- **Deployed environment**: when the change's scope deploys (`infrastructure/`, an application with a chart), read [infrastructure/AGENTS.md](../../../infrastructure/AGENTS.md) and confirm the rollout and the service's behavior.
- **Docs, skills, and other non-code changes**: every added or changed file exists on the merge commit with its merged content (`git fetch origin main`, then `git show origin/main:<path>`), and a skill is listed under `.agents/skills/`. With the check below, this is their evidence.
- **Post-release `main`**: the CI run on the tip, including the release commit, is green.

A check that cannot be run is reported as skipped with the reason, never as passed. A failed validation is a **raise to the user** with the evidence, and a proposed follow-up pull request.

## Closeout

Completion: nothing is left claiming the work is in flight, and nothing the run created is left on the machine. Run only after step 5 passes.

- **Issues**: Close each issue the pull request finished with `gh api -X POST repos/{owner}/{repo}/issues/<n>/comments -f body="<pull request and release>"`, then `gh api -X PATCH repos/{owner}/{repo}/issues/<n> -f state=closed -f state_reason=completed` (a closed issue is the done signal, and the board marks it Done by itself). An issue the pull request only advances stays In Progress. Close a parent spec only when every pull request under it is merged.

### Local cleanup

Remove only what the shipped pull requests made or used, and only once each is `MERGED`. A pull request that was left undone, ejected, or raised to the user keeps its worktree, branch, and stash for the next attempt; say so in the report.

- **Stack**: `gh stack sync --prune`.
- **Worktrees**: `git worktree list`, then `git worktree remove <path>` for each shipped branch; `--force` only after `git status` there shows nothing left to push. In a host-managed worktree session use `mcp__ccd_host__clean_up_worktrees` instead, since the session cannot delete the directory it runs in. Then `git worktree prune`.
- **Branches**: after `git fetch --prune`, `git branch -d <branch>` for each shipped local branch. A refusal means the branch holds commits `main` lacks (a squash merge hides this): compare `git diff origin/main <branch>` and report, using `-D` only on an empty diff. Delete the remote branch (`git push origin --delete <branch>`) only when GitHub's auto-delete did not.
- **Stashes**: the stack is shared with every other worktree and session. Drop only entries this run tagged: find them with `git stash list --format='%H %gs'`, then `git stash drop stash@{n}` re-found by tag. Report untagged entries; never drop them.
- **Local files**: delete scratch files, downloaded tarballs, and step 5's outside-the-workspace install directory; stop the background watchers and local servers the run started. Revert spurious tracked diffs a verification left behind (the lockfile entry) but never the committed codometer badges. Keep gitignored files the tooling needs (`node_modules`, the emitted conformetry plugin, `.nx` cache).
- **Main**: last, `git fetch origin main`, even when step 5 already did, since a release commit may have landed since. Fast-forward a checked-out local `main` with `git merge --ff-only origin/main` (never a plain pull or a rebase); report rather than force it if that refuses or the checkout has uncommitted work.
- **Check**: `git worktree list`, `git branch --list`, `git stash list`, and `git status --short` in the main checkout show only what predates the run.

## Report

End with one table row per pull request: number, outcome, release (or "none expected"), validation evidence. Then list anything left undone and why, including any worktree, branch, or stash kept on purpose.
