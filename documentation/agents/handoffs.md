# Handoffs

Repository rules for the `# Handoff` comment that [AGENTS.md](../../AGENTS.md) step 4 posts on a spec issue.

A planning session ends where an implementation session begins, and whatever the
handoff document does not say, the next agent invents. It is also the only record
that step 1's approval gate was passed, which is what makes an uninterrupted
implementation run legitimate. No skill writes it; follow these five rules:

- **Post it as a comment on the spec issue**, never in a temporary directory —
  the next session cannot be pointed at that, and the next reboot may empty it.
  On the issue, the next session gets the plan, the tickets, and the brief from
  one link. Link the spec, tickets, ADRs, and commits rather than restating
  them, and leave out secrets and personal details.
- **Prescribe the workflow skills, do not suggest them.** A list of skills an
  agent "may find useful" is a list an agent skips. Write a numbered "How to run
  this" section naming each skill in call order. For the usual spec with one
  parent issue: [using-git-worktrees](../../.agents/skills/using-git-worktrees/SKILL.md)
  for its one worktree and branch, then
  [subagent-driven-development](../../.agents/skills/subagent-driven-development/SKILL.md)
  at task granularity — a fresh subagent per commit sub-issue, one after another
  on that branch, each running
  [test-driven-development](../../.agents/skills/test-driven-development/SKILL.md)
  — then steps 6–8 of the
  [Agent Workflow](../../AGENTS.md#agent-workflow) once, for the whole pull
  request. Only when the spec has several parent issues, add a subagent per
  parent, dispatched with
  [dispatching-parallel-agents](../../.agents/skills/dispatching-parallel-agents/SKILL.md)
  for the independent ones or down a
  [gh-stack](../../.agents/skills/gh-stack/SKILL.md) chain for the dependent ones.
  Say plainly that this session is the orchestrator (on a Sonnet/Terra-level
  model): it dispatches work to Haiku/Luna-level subagents (or Sonnet/Terra-level
  only when really necessary) and reads their reports back, implementing in its
  own context only a pull request of a commit or two.
- **Answer the two questions those skills otherwise stop and ask.**
  `subagent-driven-development` keys its workspace and ledger off a **plan file
  path**, so say to export the issue's plan to a local scratch file first. And
  point `test-driven-development` at the spec's testing decisions and say to
  treat those as the seams to test through — otherwise a session told to run
  uninterrupted stops to ask before its first test.
- **Say how many pull requests the work becomes — normally one — and that every
  one of them is this session's job.** Name the branch, or at least the type and
  scopes its title must take — a squashed title is all semantic-release ever
  sees, so it decides
  [Release Significance](../../.github/CONTRIBUTING.md#release-significance). If the
  spec splits, give the mechanical reason from
  [One Pull Request by Default](../../AGENTS.md#one-pull-request-by-default) and the
  dependency order: which parents run in parallel off `main`, which stack with
  [gh-stack](../../.agents/skills/gh-stack/SKILL.md), and which must wait for a
  lower one to merge and deploy. A brief for a split spec that does not state the
  session owns **all** of its pull requests returns one and nothing else, so
  write the exit condition out — every parent merged or open — and point at
  [When a spec does split](../../AGENTS.md#when-a-spec-does-split).
  Say when each issue closes too: the session closes each commit sub-issue right
  after its commit lands, a pull request's `Closes #N` closes its parent on merge,
  and the spec stays open until every parent is merged and every acceptance item
  holds — see [Marking work in progress](issue-tracker.md#marking-work-in-progress).
- **Assign a model and thinking level per role.** Planning, orchestrating a
  ticket set, implementing a ticket or task, and reviewing a diff are different
  problems and should not draw the same reasoning budget (this overrides
  `subagent-driven-development`'s default model floor):
  - **Planning (steps 1–4)**: **Opus/Sol-level** model for clarifying,
    specifying, decomposing into tickets, and authoring the handoff.
  - **Implementation orchestration**: **Sonnet/Terra-level** model for the
    session that reads the handoff, coordinates worktrees and stacks, dispatches
    subagents, and reads their reports.
  - **Implementation tasks and subagents**: **Haiku/Luna-level** model by
    default for dispatched ticket and task subagents, escalating to a
    **Sonnet/Terra-level** model only when really necessary (such as complex
    cross-file integration, non-trivial design judgment, or fix-loop escalation
    after repeated failures).
  - **Review subagents**: **Haiku/Luna-level** or **Sonnet/Terra-level** model
    scaled to the diff's size and risk. Never spawn any subagent on an
    Opus/Sol-level model or higher — Opus/Sol is selectable only by humans for
    main sessions.
