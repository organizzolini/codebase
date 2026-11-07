---
name: link-issue
description: Make sure the work in hand has a GitHub issue that its pull request will close — find the planned ticket, file one before starting ad-hoc work, or backfill one for work already done. Use this skill before starting any change that has no ticket, before creating or updating a pull request, when a pull request has no linked issue, or when asked what belongs in an issue versus a pull request description.
license: MIT
---

# Link Issue

Every pull request in this repository must close or reference a GitHub issue through GitHub's own link: a closing keyword in the body (`Closes #N`) or the Development sidebar. The link is what `closingIssuesReferences` returns. A plain `Related to #N` or a URL in prose is not a link GitHub records, so it does not count.

This skill is the single place that decides **which issue** a change belongs to. The pull request skills call it instead of repeating the logic.

## When to Use This Skill

- Starting work that no ticket describes (**file first**)
- Finishing work that was done without an issue (**backfill**)
- Creating or updating a pull request ([create-pull-request](../create-pull-request/SKILL.md), [update-pull-request](../update-pull-request/SKILL.md), [submit-changes](../submit-changes/SKILL.md))
- Deciding whether a detail belongs in the issue or the pull request

## Decide Which Case You Are In

| Situation                                            | Case         | Action                                    |
| ---------------------------------------------------- | ------------ | ----------------------------------------- |
| A parent ticket for this pull request already exists | **Planned**  | Use it. Do not file another               |
| No ticket, and the work has not started              | **File**     | File an issue now, before the first test  |
| No ticket, and the work is already done              | **Backfill** | File an issue from the diff, then link it |

Search before filing, so a duplicate is never created:

```bash
gh issue list --state open --search "<keywords from the change>"
gh issue list --state all --search "<keywords>" --limit 10
```

Also check the branch name, the commit messages, and the spec the task came from. A planned pull request has **one parent Task issue** (see [issue-tracker](../../../documentation/agents/issue-tracker.md#planning-shape-a-spec-its-pull-requests-and-their-commits)); that parent is the issue the pull request closes. Never close a spec or a commit sub-issue from a pull request that does not finish it.

## File an Issue

Pick the Issue Type by position in the hierarchy:

- No parent (a standalone change): **Bug** when the commit type is `fix`, otherwise **Feature**
- Under a spec or a parent: **Task**

Take the title from the commit convention, `<type>(<scope>): <gitmoji> <subject>`, and apply the labels the Continuous Compliance issue check expects: one `type:*`, one `scope:*` per scope, and `source:agent`. Add `status:in-progress` when you are about to start, or are already doing, the work.

```bash
gh issue create \
  --type Bug \
  --title "fix(caelundas): 🐛 correct timezone offset in ephemeris" \
  --label type:fix --label scope:caelundas \
  --label source:agent --label status:in-progress \
  --body-file /tmp/issue_body.md
```

Cloud sessions have no `gh`. Use the GitHub MCP `search_issues` to look first and `issue_write` (`method: create`, with `labels` and `type`) to file.

## Backfill

When the work is already done, file the issue from what the diff shows: the problem the change solves, why it was needed, and the acceptance criteria it now meets. Write it as if it had been filed first. Do not paste the diff or list files; that is the pull request's job. Then link it exactly as below.

## Link It

Put the closing keyword in the pull request body as the **first bullet of 🔗 Related**:

```markdown
## 🔗 Related

- Closes #123
```

Then confirm GitHub recorded it:

```bash
gh pr view <number> --json closingIssuesReferences --jq '.closingIssuesReferences[].number'
```

An empty result means the link is missing: fix the keyword, or add the issue under **Development** in the pull request sidebar. GitHub honors closing keywords only for a pull request whose base is the default branch, so a stacked pull request from [gh-stack](../gh-stack/SKILL.md) may need the sidebar link. Run the command above on every pull request rather than assuming.

## Issue vs Pull Request Content

The issue holds the **why and the intent**; the pull request holds the **what, as built**. Each states a thing once and links to the other.

|             | Issue                                                                                                     | Pull request                                                                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Title       | Free-form backlog shape; a parent Task carries the title its pull request will have                       | Conventional commit format; becomes the squash commit and release note                                                                                                   |
| Body        | Problem, motivation, acceptance criteria, scope and non-goals, decisions, plan and sub-issues, discussion | Summary: outcome in one paragraph. Details: what changed, including deviations from the plan. Testing: how it was verified. Related: `Closes #N` first, then extra links |
| Never holds | As-built implementation notes                                                                             | A copy of the requirements or the discussion                                                                                                                             |

When the implementation departs from the issue, record the departure in the pull request's Details and, if the acceptance criteria changed, edit the issue. Do not restate the issue's requirements in the pull request.

## Resources

- [issue-tracker](../../../documentation/agents/issue-tracker.md) — Labels, Issue Types, planning shape, marking work in progress
- [create-pull-request skill](../create-pull-request/SKILL.md) — Pull request title, description, and linking keywords
- [github-issues skill](../github-issues/SKILL.md) — Issue operations through MCP tools
