---
name: triage-integration
description: "Diagnose and fix integration failures, local (the pre-commit, commit-msg, and pre-push hooks) or remote (a red GitHub Actions check). Use when a commit is rejected, a push fails, or a CI check goes red. Fetches the logs, names the failing target and project, and fixes the root cause — formatting, lint, types, spelling, dead code, sync checks, the IC-suite gates, and conventions."
argument-hint: "Optional: paste failure logs, or name a workflow or run URL to fetch"
---

# Triage Integration Failures

Find which check failed and why, fix the root cause, and prove the fix with the same check. Most failures here mean [validate-code](../validate-code/SKILL.md) was skipped before committing; say so when you report.

## Rules

- **Fix the cause.** Never a disable comment, a loosened compiler option, an ignore entry added only to pass, a raised limit, a weakened test, or `--no-verify`.
- **Do not commit, push, or run lint-staged during triage.** Leave every fix unstaged for the user to review, unless the task that sent you here was already committing — then hand back to it.
- **Fix only what the failure names.** A failure in a file outside the change, or one that also fails on `origin/main`, is not yours: report it instead of fixing it here.

## Step 1: Get the Logs

**A local hook.** The output names the hook that failed. For `pre-commit`, the full output is in `last-lint-staged-output.log` at the workspace root. [hooks.md](references/hooks.md) says what each hook runs and how to reproduce it.

**A CI check.** Fetch only the run the user named, or every failing check on the head commit:

```bash
gh run view <run-id> --log-failed
gh api "repos/{owner}/{repo}/commits/$(git rev-parse HEAD)/check-runs" \
  --jq '.check_runs[] | select(.conclusion == "failure") | "\(.name) \(.html_url)"'
```

In a cloud session without `gh`, use the GitHub MCP `get_job_logs` tool. CI's Static leg runs `typecheck-code,format-code,lint-code,deprecate-code` and its Guard leg `guard-code`, all with `--configuration=check` over `nx affected`. A `Comply` failure is pull request metadata: see [create-pull-request](../create-pull-request/SKILL.md), and fire a fresh event rather than re-running, since a re-run replays the old payload.

## Step 2: Name the Failure

From the output, name the **Nx target** (`oxfmt`, `eslint`, `typecheck`, `spell-check`, `codependix-bound`, …), the **project**, and the **tool's own message**. One import cycle can crash the Nx plugin worker and fail dozens of tasks at once; look for the first error, not the count.

## Step 3: Fix It

Run the failing target's `write` configuration where it has one — formatting, lint autofixes, knip, markdownlint, and every sync check:

```bash
pnpm exec nx run-many --targets=<target> --projects=<project> --configuration=write
```

Everything else is a manual fix. [tool-fixes.md](references/tool-fixes.md) has each tool's configuration, the manual fix for each, the sync checks and what they keep in step, and common symptoms. The IC-suite gates in `guard-code` each have their own triage skill, named there.

## Step 4: Prove It

Re-run the exact command that failed, with `--configuration=check`, and repeat until it passes: a first fix often uncovers the next error behind it. Then run [validate-code](../validate-code/SKILL.md) over the change, so the next push does not fail on a check the hook skipped.

## Step 5: Report

```text
Errors Found
- <hook or CI check>: <target> (<project>) — <message>

Fixes Implemented
- <write command, or the manual change>
- Files changed: <list> (unstaged)

Validation
- <check command> — ✅ passed

Remaining Actions
- <none | what the user still has to do>
```

## References

- [hooks.md](references/hooks.md) — What each Husky hook and lint-staged run checks, and how to reproduce it
- [tool-fixes.md](references/tool-fixes.md) — Per-tool configuration and fixes, sync checks, common symptoms
- [validate-code](../validate-code/SKILL.md) — The full suite to run before committing
- [ship-changes](../ship-changes/SKILL.md) — Known CI flakes and when to re-run, for a pull request on its way to `main`
