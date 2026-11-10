---
name: manage-project
description: Keep the organizzolini/codebase GitHub Project board filled in — set an issue's Status, Priority, and Effort, move work to In Progress, and know when a milestone applies. Use when starting or finishing work on an issue, after filing or sorting issues, when estimating effort or prioritizing work, when asked what is on the board, or when a board view shows items with no Priority or Effort.
license: MIT
---

# Manage Project

The board is the organization project [codebase](https://github.com/orgs/organizzolini/projects/1). Issues and pull requests join it automatically, and a closed issue becomes **Done** by itself. Everything else on the board is a field, and **an item with an empty field is unfinished work on the item**, not a style choice.

Its views are one per project area (`caelundas`, `lexico`, `ic-suite`, …), plus `tickets` and `changes`. They filter on `scope:*` labels, so the labels from [issue-tracker](../../../documentation/agents/issue-tracker.md) place an item in a view and the fields below order it within one.

## Fields

| Field    | Set on                                                   | Values                    | Who sets it                                      |
| -------- | -------------------------------------------------------- | ------------------------- | ------------------------------------------------ |
| Status   | Spec, parent issue, and commit sub-issue                 | Todo, In Progress, Done   | Todo and Done are automatic; you set In Progress |
| Priority | Spec and any standalone issue                            | Urgent, High, Medium, Low | The user. An agent proposes, never decides       |
| Effort   | Parent issue (one pull request) and any standalone issue | Low, Medium, High         | The agent that plans or files it                 |

Never invent a value outside the list. If a field has no option you need, say so rather than editing the field.

**Priority and Effort are organization issue fields, not project fields.** They live on the issue, travel with it, and show on the board as read-only columns, so `set_field` cannot write them (GitHub answers "Only custom fields can be updated"). Only Status is a project field. The organization also defines **Start date** and **Target date** issue fields, which this repository does not use.

### Estimating effort

Effort is the work a pull request carries, measured in planned commits and modules touched. It is an estimate for ordering work, so choose fast and move on.

| Effort | Shape                                                        |
| ------ | ------------------------------------------------------------ |
| Low    | One commit, with its tests                                   |
| Medium | Two to four commits in one module                            |
| High   | Five or more commits, or more than one module in one project |

A `High` that would not fit one reviewable pull request is a planning defect: split it into parent issues under a spec before anyone builds it.

## Fill the Board

- **When you file or plan an issue**, set Effort on every parent issue and standalone issue. Set Priority only when the user gave one; leave it empty and say so in your report when they did not.
- **When you start work**, set Status to **In Progress** on every layer the work is about to move — the spec, the parent issue, and the commit sub-issue. This replaces the retired `status:in-progress` label. Do it before the first failing test.
- **When work finishes**, close the issue. The board marks it Done; there is nothing to set.
- **When you find an open item with no Effort**, estimate it. Do not pad: a wrong Effort is corrected by the next reader, a missing one is not noticed.

## Set a Field

Look the ids up by name each time; they are not stable enough to copy into a script. `gh project item-edit` needs the project id, the item id, the field id, and the option id.

```bash
# set_field <issue-number> <Field> <Option>   e.g. set_field 2187 Status "In Progress"
set_field() {
  local number=$1 field=$2 option=$3
  local project item fields
  project=$(gh project view 1 --owner organizzolini --format json --jq .id)
  item=$(gh api graphql -F number="$number" -f query='
    query($number: Int!) {
      repository(owner: "Organizzolini", name: "codebase") {
        issue(number: $number) {
          projectItems(first: 10) { nodes { id project { number } } }
        }
      }
    }' --jq '.data.repository.issue.projectItems.nodes[] | select(.project.number == 1) | .id')
  fields=$(gh project field-list 1 --owner organizzolini --format json)
  gh project item-edit --id "$item" --project-id "$project" \
    --field-id "$(jq -r --arg f "$field" '.fields[] | select(.name == $f) | .id' <<<"$fields")" \
    --single-select-option-id "$(jq -r --arg f "$field" --arg o "$option" \
      '.fields[] | select(.name == $f) | .options[] | select(.name == $o) | .id' <<<"$fields")"
}
```

Priority and Effort go through the issue-field endpoint instead, and take the option **name**, not its id. Set Priority only when the user gave a value:

```bash
echo '{"issue_field_values":[{"field_id":46460698,"value":"Medium"}]}' |
  gh api -X PUT repos/Organizzolini/codebase/issues/<number>/issue-field-values --input -
# clear it
gh api -X DELETE repos/Organizzolini/codebase/issues/<number>/issue-field-values/46460698
```

`46460698` is the Effort field's id and `46460695` is Priority's; re-read `gh api orgs/organizzolini/issue-fields` if the endpoint rejects either.

An empty `item` means the issue has not reached the board yet: the auto-add workflow lags a few seconds behind filing, so wait and retry once before reporting it.

**Projects are rate-limited.** Every call above is GraphQL, which draws on a budget of 5,000 points an hour shared with every other tool and agent on the account. Set fields for the few issues you touch. Never walk the whole board with `gh project item-list --limit 3000`; it exhausts the budget for everyone. Check `gh api rate_limit --jq .resources.graphql` before any bulk edit.

Cloud sessions have no `gh`; the GitHub MCP server has no Projects tools, so report the fields you could not set instead of skipping them silently.

## Milestones

**This repository does not use milestones.** The unit of planning is the spec, a root Feature or Bug issue, and it carries what a milestone cannot: an Issue Type, labels, sub-issues with a progress bar, dependencies, a `# Handoff` comment, and its own Status and Effort on the board. One milestone has ever existed (`Conformetry Migration`, closed), and nothing reads it.

Do not set a milestone on an issue or pull request unless the user asks. If one is created, it groups several specs under one shippable outcome and sits **above** them; it never replaces the spec. Assign it to specs only (`gh issue edit <n> --milestone "<name>"`) so the milestone's progress bar counts specs, not every commit.

## Resources

- [issue-tracker](../../../documentation/agents/issue-tracker.md) — Issue Types, labels, planning shape, marking work in progress
- [triage-labels](../../../documentation/agents/triage-labels.md) — the `status:*` triage vocabulary
- [link-issue skill](../link-issue/SKILL.md) — filing the issue a pull request closes
