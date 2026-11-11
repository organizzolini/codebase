#!/bin/bash
#
# PreToolUse hook: stops subagents spawning on Opus/Sol or higher.
#
#   - Silent for Haiku/Luna or Sonnet/Terra, or a general-purpose agent with no `model`
#     (it falls back to CLAUDE_CODE_SUBAGENT_MODEL)
#   - Denies a `model` naming Opus, Fable, or Sol, reserved for main sessions
#   - Denies built-in Explore and Plan calls without `model`, which ignore the fallback

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
