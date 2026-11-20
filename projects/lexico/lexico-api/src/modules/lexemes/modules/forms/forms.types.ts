// 🏷️ Types

/** `Form` columns the API omits: audit, soft-delete, and lexeme joins. */
export type FormDatabaseOnlyField =
  | "createdAt"
  | "createdBy"
  | "deletedAt"
  | "deletedBy"
  | "lexeme"
  | "updatedAt"
  | "updatedBy"
  | "wordForms";
