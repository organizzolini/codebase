# Handoffs

Repository rules for the `# Handoff` comment that [AGENTS.md](../../AGENTS.md) step 4 posts on a spec issue.

A planning session ends where an implementation session begins, and whatever the
handoff document does not say, the next agent invents. It is also the only record
that step 1's approval gate was passed, which is what makes an uninterrupted
implementation run legitimate. Five repository rules override
[handoff](../../.agents/skills/handoff/SKILL.md)'s defaults:

- **Post it as a comment on the spec issue**, not in the operating system's
  temporary directory the skill defaults to — the next session cannot be pointed
  at that, and the next reboot may empty it. On the issue, the next session gets
  the plan, the tickets, and the brief from one link.
- **Prescribe the workflow skills, do not suggest them.** A list of skills an
  agent "may find useful" is a list an agent skips. Write a numbered "How to run
  this" section naming each skill in call order:
  [using-git-worktrees](../../.agents/skills/using-git-worktrees/SKILL.md) for each
  ticket's own worktree, then
  [subagent-driven-development](../../.agents/skills/subagent-driven-development/SKILL.md)
  at ticket granularity — a fresh subagent per parent issue, dispatched
  together with
  [dispatching-parallel-agents](../../.agents/skills/dispatching-parallel-agents/SKILL.md)
  for the tickets that are independent, or one at a time down a
  [gh-stack](../../.agents/skills/gh-stack/SKILL.md) chain for the ones that are
  not — and, inside each dispatched ticket,
  [implement](../../.agents/skills/implement/SKILL.md) and
  [tdd](../../.agents/skills/tdd/SKILL.md), with subagent-driven-development invoked
  again at task granularity if that ticket itself splits into several tasks,
  then steps 6–8 of the [Agent Workflow](../../AGENTS.md#agent-workflow). Say plainly that this session is the orchestrator (on a Sonnet/Terra-level model): it
  dispatches tickets to Haiku/Luna-level subagents (or Sonnet/Terra-level only
  when really necessary) and reads their reports back, and implements a ticket in
  its own context only when the spec holds exactly one.
- **Answer the two questions those skills otherwise stop and ask.**
  `subagent-driven-development` keys its workspace and ledger off a **plan file
  path**, so say to export the issue's plan to a local scratch file first. And
  `tdd` will not write a test at an unconfirmed seam, so point it at the spec's
  Testing Decisions and say to treat those as the confirmation — otherwise a
  session told to run uninterrupted stops before its first test.
- **Say how the work is cut into pull requests, and that every one of them is
  this session's job.** One ticket per pull request, and name each branch or at
  least the type and scope every branch must take — a squashed title is all
  semantic-release ever sees, so the ticket split decides
  [Release Significance](../../.github/CONTRIBUTING.md#release-significance). Then give the dependency order:
  which tickets are independent and run in parallel off `main`, and which stack
  with [gh-stack](../../.agents/skills/gh-stack/SKILL.md) because one needs another's
  branch underneath it. "This session's job" means dispatching and
  orchestrating every one of them — see
  [Multiple Pull Requests](../../AGENTS.md#multiple-pull-requests) for why that, not
  implementing each ticket directly, is the rule. A brief that lists tickets
  without stating that the session owns **all** of them is a brief that
  returns one pull request and nothing else, so write the exit condition
  out — every ticket merged or open — and point at that same section.
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
