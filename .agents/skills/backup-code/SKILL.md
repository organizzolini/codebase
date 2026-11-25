---
name: backup-code
description: "Snapshot local work before anything hard to undo, and restore from the snapshot when it goes wrong. Use before reset, rebase, clean, a force push, a history rewrite, or a mass edit or codemod, and when recovering a deleted file or rolling back a failed refactor or rebase."
argument-hint: "Describe the risky operation about to run, or what needs restoring."
license: MIT
---

# Backup Code

Take a snapshot before anything hard to undo, and restore from it — previewing first — when the operation goes wrong.

## Back Up

The snapshot is a commit holding everything in the working tree, tracked and untracked (gitignored files excepted), on a `backup/<branch>/<timestamp>` branch. It is built with plumbing, so it **switches no branch, touches neither the working tree nor the index, and runs no hook** — a backup commit that went through `git commit` would run lint-staged and commitlint, which is slow and can reject it.

```bash
label="before-rebase"   # what you are about to do
timestamp="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
branch="$(git branch --show-current)"
index="$(mktemp)"
cp "$(git rev-parse --git-path index)" "${index}"
tree="$(GIT_INDEX_FILE="${index}" sh -c 'git add -A && git write-tree')"
rm -f "${index}"
snapshot="$(git commit-tree "${tree}" -p HEAD -m "backup: ${label}")"
git branch "backup/${branch}/${timestamp}" "${snapshot}"
git show --stat "backup/${branch}/${timestamp}"
```

Then print the restore command for the user and go ahead with the risky operation:

```bash
git restore --source "backup/${branch}/${timestamp}" --worktree -- .
```

- The snapshot stays local: `backup/*` fails branch-name validation, so never push it.
- With nothing changed, the snapshot still records `HEAD`, the baseline to return to.
- Mid-merge or mid-rebase, finish or abort that first; the index is not a snapshot then.

## Restore

Look before restoring, and keep the backup until the restore is confirmed.

1. **Find the source.** `git branch --list 'backup/*'`, `git stash list --date=local`, and, when no backup exists, `git reflog` for the commit before the damage.
2. **Snapshot what is there now** with [Back Up](#back-up), if any of it might still be wanted.
3. **Preview.** `git diff --stat HEAD <source>` for the whole tree, `git diff HEAD <source> -- <path>` for one file.
4. **Restore the smallest scope that fixes it:**

   | Need                        | Command                                                                                                                           |
   | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
   | One or a few files          | `git restore --source <source> -- <path>`                                                                                         |
   | The whole working tree      | `git restore --source <source> --worktree -- .`                                                                                   |
   | The branch back to a commit | `git switch -c restore/<timestamp> <source>`, then compare; `git reset --hard <source>` only once nothing on the branch is wanted |
   | A stash                     | `git stash apply 'stash@{N}'` (keeps the entry), never `pop` until it applied cleanly                                             |

5. **Verify.** `git status --short` and `git diff --stat` show only what you meant to restore; run the affected tests.
6. **Clean up** only after verifying: `git branch -D backup/<branch>/<timestamp>`.

| Problem                                            | Fix                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| `unknown revision or path not in the working tree` | Re-list sources: `git branch --list 'backup/*'`, `git stash list`          |
| A stash applies with conflicts                     | Apply it on a scratch branch (`git switch -c restore/<timestamp>`) instead |
| Restored too much                                  | `git restore -- <path>` for the unwanted files, then restore selectively   |
| Work lost with no backup                           | `git reflog`, then `git switch -c restore/<timestamp> <reflog-sha>`        |
