#!/bin/bash
#
# PreToolUse hook — prevents subagents from being spawned on Opus/Sol or higher.
#
#   - Silent when the requested subagent model is Haiku/Luna or Sonnet/Terra, or
#     when a general-purpose subagent omits `model` and falls back to
#     CLAUDE_CODE_SUBAGENT_MODEL ("haiku")
#   - Denies the tool call when `model` names Opus, Fable, or Sol (reserved for
#     human-selected main sessions)
#   - Denies built-in Explore and Plan subagent calls that omit `model`, since
#     those ignore CLAUDE_CODE_SUBAGENT_MODEL and inherit the main session model

command -v jq &>/dev/null || exit 0

jq -c '
  (.tool_input.model // .toolArgs.model // "") as $model |
  (.tool_input.subagent_type // .tool_input.agent_type // .toolArgs.agent_type // "") as $subagent_type |
  if ($model | test("opus|fable|\\bsol\\b"; "i")) then
    {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Subagents cannot use Opus/Sol or higher (reserved for human-selected main sessions). Retry with a Haiku/Luna-level model (\"haiku\"/\"luna\", default) or a Sonnet/Terra-level model (\"sonnet\"/\"terra\", when really necessary)."
      }
    }
  elif (($subagent_type | test("^(explore|plan)$"; "i")) and ($model == "")) then
    {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Built-in Explore and Plan subagents inherit the main session model when model is omitted. Retry with a Haiku/Luna-level model (\"haiku\"/\"luna\") or a Sonnet/Terra-level model (\"sonnet\"/\"terra\", when really necessary)."
      }
    }
  else
    empty
  end
'
