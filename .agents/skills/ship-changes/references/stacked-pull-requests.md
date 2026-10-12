# Stacked pull requests

Read when a pull request's base is another branch, or `gh stack view --json` finds a stack (exit 2 means it is not in one). Command flags and exit codes live in [gh-stack](../../gh-stack/SKILL.md); this file covers what landing a stack adds.

## Land the stack as one unit

`gh pr merge` cannot merge a stack. Use `gh stack merge`, which merges atomically: every unmerged pull request up to and including the one named, or none.

```bash
gh stack merge <top-pr> --yes --squash
```

- Name the **top** pull request to land the whole stack. Name a lower one to land only a prefix, and only when the user asked for a partial landing.
- Under this repository's merge queue the whole set enters the queue together. If the queue ejects one, it ejects every pull request above it, so a failure at layer N returns layers N and up to step 1.
- A merge group may exceed its maximum size (6) by up to 50%, so a stack fits one group up to 9 entries and otherwise splits across groups, which is normal.
- GitHub evaluates reviews, CODEOWNERS, status checks, and code scanning against the **stack base** (`main`) and requires every layer below to qualify. One layer short of approval or green blocks the whole merge. Bypassing is unsupported; never pass `--admin`.
- Each layer squashes to its own commit titled by its own pull request, so each layer carries its own release significance. Compute the expected release **per layer** in step 4; they usually release together through one run on the tip.
- Exit 9 means stacked pull requests are not enabled on the repository: report it to the user.

## Step 1 across layers

- Count check names on **every** layer. Six green names is a normal stacked layer (CodeQL and its `Analyze` jobs run only against `main`); a layer missing the four real gates (Lint, Test Coverage, Validate Conventions, Make Projects) is conflicting or draft.
- Draft pull requests skip Continuous Integration entirely. `gh stack submit` opens drafts, so run `gh pr ready <n>` per layer.
- After any change to a lower layer, run `nx run <project>:typecheck` on **each** layer above it. A rebase replays cleanly while leaving upper layers type-broken, and vitest stays green because it does not typecheck.

## Step 2 across layers

Stacks need linear history, so use the stack's own commands instead of merging `main`:

```bash
gh stack sync --remote origin     # fetch, fast-forward trunk, cascade-rebase, push, refresh PR state
gh stack rebase --remote origin   # on exit 3; resolve, `git add`, `gh stack rebase --continue`
gh stack push --remote origin
```

- Run `gh stack` non-interactively: `view --json`, `submit --auto`, `checkout <target>`; never `modify`, `switch`, or a bare `init`/`add`.
- `sync` exiting 0 with `Sync aborted` means local and remote stacks diverged and nothing changed. Follow the divergence recovery in gh-stack's troubleshooting reference.
- Resolve generated-file conflicts at the layer that owns them, then regenerate, as in the main steps; `rerere` replays the resolution on the layers above.
- A conflict in hand-written code is still a **raise to the user**.

## After the bottom layer lands

GitHub rebases the remaining layers itself. Run `gh stack sync --prune`, then re-read `gh stack view --json`: every merged layer shows `isMerged`, and the rest show `needsRebase: false`. A queued layer never needs pushing again; leave it alone, and never `unstack` while a layer is queued.

## Order across independent stacks and pull requests

Stacks and standalone pull requests with no shared branch enter the queue in parallel. Same-scope changes collide on `README.md` generated blocks, so expect step 2 for whichever lands second.
