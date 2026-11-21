// ♟️ Constants

/** Reshapes a REST issue into the audit document: body, labels, type, parent. */
export const ISSUE_DOCUMENT_QUERY =
  '{body: .body, issueType: (if .type == null then null else {name: .type.name} end), labels: [.labels[] | {name: .name}], parent: (if .parent_issue_url == null then null else {number: (.parent_issue_url | split("/") | last | tonumber)} end)}';

/** Said when a pull request closes no issue at all. */
export const NO_LINKED_ISSUE_MESSAGE =
  "❌ No issue is closed by this pull request. Add a `Closes #<issue>` bullet to the 🔗 Related section.";
