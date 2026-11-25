# CI Checks

All PRs must pass these checks before merging:

| Check                | Command                                                                    | Description                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Branch Name          | `validate-branch-name`                                                     | Branch follows naming conventions                                                                                              |
| PR Title             | `commitlint`, `compliance pull-request`                                    | Title follows commit message format and names at most 3 scopes                                                                 |
| PR Body              | `compliance pull-request`                                                  | Required sections: 🌰 Summary, 📝 Details, 🧪 Testing, 🔗 Related, each in its shape and within its word limit                 |
| Issue Link           | `compliance pull-request`                                                  | Pull request closes or references an issue (`closingIssuesReferences` is not empty)                                            |
| Release Significance | `compliance pull-request`                                                  | Title's type is at least as significant as the most significant commit, and the title names at least one scope its commits use |
| Static               | `nx affected --target=typecheck-code,format-code,lint-code,deprecate-code` | Typecheck and type coverage; formatting and spelling; ESLint and oxlint; knip and fallow                                       |
| Guard                | `nx affected --target=guard-code`                                          | Depth, boundaries, glossaries, conformance, and the repository's own sync checks                                               |
| Test                 | `nx affected --target=vitest --configuration=coverage`                     | Unit and integration tests against the coverage gates                                                                          |

There is no `lint`, `format`, or `clean` target in this workspace. `nx affected
--target=lint` exits 0 printing "No tasks were run", so it is a check that
passes without checking anything — always name a real target.

Run the [validate-code skill](../../validate-code/SKILL.md) before pushing, then the coverage gate:

```bash
nx affected --target=vitest --configuration=coverage --base=main
```

## Troubleshooting

| Issue             | Cause                                  | Solution                                                                                                              |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| CI failing        | Code issues                            | Diagnose with [triage-integration](../../triage-integration/SKILL.md)                                                 |
| Merge conflicts   | Branch out of date                     | Merge `origin/main` in, as [ship-changes](../../ship-changes/SKILL.md#2-conflicts) step 2 describes                   |
| PR title rejected | Format incorrect                       | Follow commit message conventions                                                                                     |
| PR body rejected  | Missing required sections              | Add ## 🌰 Summary, ## 📝 Details, ## 🧪 Testing, ## 🔗 Related sections                                               |
| PR body rejected  | Section in the wrong shape or too long | Match the [Description Guidelines](../SKILL.md#description-guidelines) table; indent code blocks under a Testing step |
| No linked issue   | No closing keyword, or no issue yet    | File or find one with [link-issue](../../link-issue/SKILL.md); make `Closes #N` the first Related bullet              |
| Tests failing     | Missing dependencies                   | Run `pnpm install`                                                                                                    |
| Typecheck errors  | Type issues                            | Fix TypeScript errors                                                                                                 |

If a branch update goes wrong, restore from the snapshot taken with [backup-code](../../backup-code/SKILL.md#restore).
