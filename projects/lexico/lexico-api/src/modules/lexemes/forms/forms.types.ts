// 🏷️ Types

/**
 * The `Form` columns the API omits: audit and soft-deletion columns, and joins
 * to its lexeme and to the words it surfaces as.
 */
export type FormDatabaseOnlyField =
  | "createdAt"
  | "createdBy"
  | "deletedAt"
  | "deletedBy"
  | "lexeme"
  | "updatedAt"
  | "updatedBy"
  | "wordForms";
