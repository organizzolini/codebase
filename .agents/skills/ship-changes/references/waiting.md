# Waiting

Read when a step waits on Continuous Integration, the merge queue, or a release. Run the watcher in the background (`run_in_background`); its `sleep` is fine there, and its exit wakes the session. It ends on the first state that needs action, so decide from the word it prints:

| Output        | Meaning                                | Next                              |
| ------------- | -------------------------------------- | --------------------------------- |
| `MERGED`      | The pull request merged                | Step 4                            |
| `CLOSED`      | Closed without merging                 | Report; do not reopen             |
| `CONFLICTING` | `mergeable_state` is `dirty`           | Step 2                            |
| `EJECTED`     | A `merge_group` run for it failed      | Step 3, with that run's logs      |
| `FAILED`      | A check run on the head failed         | Step 1                            |
| `GREEN`       | No pending or failed check on the head | Step 3, if not already queued     |
| `TIMEOUT`     | About an hour passed with no change    | Re-arm once, then report as stuck |

```bash
pr=<n>
for i in $(seq 1 180); do
  read -r state merged mstate head < <(gh api "repos/{owner}/{repo}/pulls/$pr" --jq '"\(.state) \(.merged) \(.mergeable_state) \(.head.sha)"')
  if [ "$state" = closed ]; then [ "$merged" = true ] && echo MERGED || echo CLOSED; exit; fi
  [ "$mstate" = dirty ] && { echo CONFLICTING; exit; }
  ejected=$(gh api "repos/{owner}/{repo}/actions/runs?event=merge_group&per_page=20" --jq "[.workflow_runs[] | select(.head_branch | test(\"pr-$pr-\")) | select(.conclusion == \"failure\")] | length")
  [ "${ejected:-0}" != 0 ] && { echo EJECTED; exit; }
  read -r failed pending < <(gh api "repos/{owner}/{repo}/commits/$head/check-runs?per_page=100" --jq '"\([.check_runs[] | select(.conclusion == "failure")] | length) \([.check_runs[] | select(.status != "completed")] | length)"')
  [ "${failed:-0}" != 0 ] && { echo FAILED; exit; }
  [ "${pending:-1}" = 0 ] && [ "$mstate" = clean ] && { echo GREEN; exit; }
  sleep 20
done
echo TIMEOUT
```

Also arm `subscribe_pr_activity` on the pull request, which delivers review comments and queue events the watcher does not read. After a release, watch the tip's runs with `gh run list --branch main` rather than the pull request.
