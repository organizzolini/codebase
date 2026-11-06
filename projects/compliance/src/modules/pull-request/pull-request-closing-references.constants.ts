// ♟️ Constants

/**
 * The mutation behind the Development sidebar. A `Closes` line in a
 * description links an issue only when the pull request targets the default
 * branch, so a stacked pull request needs this call for a real link.
 */
export const CLOSE_ISSUE_REFERENCES_MUTATION =
  "mutation($pullRequest: ID!, $issue: ID!) { addCloseIssueReferences(input: { pullRequestIds: [$pullRequest], issueId: $issue }) { clientMutationId } }";
