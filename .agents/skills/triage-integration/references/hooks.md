# Local Hooks

Husky runs three hooks from `configuration/repository/.husky/`. Each prints a timestamped line naming itself, so the output says which one failed.

## pre-commit

[pre-commit](../../../../configuration/repository/.husky/pre-commit) checks the signing configuration, takes the scratch `notepads/` files out of the index, and runs lint-staged with [lint-staged.config.ts](../../../../configuration/repository/lint-staged.config.ts), writing everything to `last-lint-staged-output.log` at the workspace root:

```bash
cat last-lint-staged-output.log
```

| Staged file pattern                     | Commands lint-staged runs                                                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `{**/package.json,pnpm-workspace.yaml}` | The `integration lockfile` check, run as the CLI directly rather than through its Nx target                                 |
| `**/package.json`                       | `nx run-many --projects=integration --targets=catalog-manifests`, then `--projects=configuration --targets=sherif,syncpack` |
| `*` (every staged path)                 | `nx affected --target=typecheck,oxlint,oxfmt,coinagerie-check --configuration=check --base=HEAD --head=<staged-commit>`     |

The commit gate is deliberately light: **ESLint, spelling, markdownlint, dead-code checks, and `guard-code` run only in CI.** A clean commit therefore proves little — run the [validate-code skill](../../validate-code/SKILL.md) before committing to catch what CI will.

`<staged-commit>` is a throwaway commit of the index on top of `HEAD`, so Nx diffs `package.json` and `pnpm-lock.yaml` field by field the way CI does. To reproduce the run by hand, stage the files and pass `--head=$(git commit-tree "$(git write-tree)" -p HEAD --no-gpg-sign -m staged)`. A staged conformetry template adds `--files=configuration/ic-suite/conformetry.config.ts`, since `nx affected` cannot always see a template's instances; a repository with no `HEAD` falls back to one `--files=` flag per staged path.

A check **killed** rather than failed (exit 137, or lint-staged's `Task failed to spawn`) is memory pressure or a Node major that differs from `.nvmrc`; the hook prints which.

## commit-msg

[commit-msg](../../../../configuration/repository/.husky/commit-msg) runs commitlint with [commitlint.config.ts](../../../../configuration/repository/commitlint.config.ts):

```bash
NODE_OPTIONS='--import=tsx' commitlint --config configuration/repository/commitlint.config.ts --edit <msg-file>
```

Fix the message to the format in [commit-code](../../commit-code/SKILL.md): `<type>(<scope>): <gitmoji> <subject>`, no body but `Co-authored-by:` and `Claude-Session:` trailers, no footer.

## pre-push

[pre-push](../../../../configuration/repository/.husky/pre-push) runs `validate-branch-name --test <branch>` for every pushed branch, reading [validate-branch-name.config.cjs](../../../../validate-branch-name.config.cjs), then checks that every pushed commit is signed. A rejected name is renamed with [checkout-branch](../../checkout-branch/SKILL.md#rename-a-branch); an unsigned commit is re-signed with [sign-commits](../../sign-commits/SKILL.md). Do not run `check-push-commit-signatures.sh` by hand: it reads the hook's standard input and can hang without it.
