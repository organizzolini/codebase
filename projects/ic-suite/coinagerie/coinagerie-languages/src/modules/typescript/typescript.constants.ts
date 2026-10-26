// ♟️ Constants

import ts from "typescript";

/**
 * How each TypeScript and JavaScript extension is parsed.
 *
 * JavaScript is parsed by the same compiler, which reads JSX in every
 * JavaScript file the way bundlers do.
 */
export const TYPESCRIPT_SCRIPT_KINDS: ReadonlyMap<string, ts.ScriptKind> =
  new Map([
    [".cjs", ts.ScriptKind.JS],
    [".cts", ts.ScriptKind.TS],
    [".js", ts.ScriptKind.JS],
    [".jsx", ts.ScriptKind.JSX],
    [".mjs", ts.ScriptKind.JS],
    [".mts", ts.ScriptKind.TS],
    [".ts", ts.ScriptKind.TS],
    [".tsx", ts.ScriptKind.TSX],
  ]);

/**
 * Declarations whose name may be written as a quoted string.
 *
 * A quoted name here is a key — `{ "quoted-key": 1 }`, `enum E { "Member" }`
 * — and counts as an identifier. Every other string literal is text, and
 * contributes nothing.
 */
export const QUOTABLE_NAME_OWNER_KINDS: ReadonlySet<ts.SyntaxKind> = new Set([
  ts.SyntaxKind.EnumMember,
  ts.SyntaxKind.GetAccessor,
  ts.SyntaxKind.MethodDeclaration,
  ts.SyntaxKind.MethodSignature,
  ts.SyntaxKind.PropertyAssignment,
  ts.SyntaxKind.PropertyDeclaration,
  ts.SyntaxKind.PropertySignature,
  ts.SyntaxKind.SetAccessor,
]);

/**
 * Every word TypeScript treats as a keyword, reserved or contextual, sorted.
 *
 * A plain array, so a configuration can spread it into `exclude.words` to
 * leave the language's own vocabulary out of its glossary. Nothing is excluded
 * unless it is spread there. A test holds it equal to the compiler's own list.
 */
export const typescriptKeywords: string[] = [
  "abstract",
  "accessor",
  "any",
  "as",
  "assert",
  "asserts",
  "async",
  "await",
  "bigint",
  "boolean",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "constructor",
  "continue",
  "debugger",
  "declare",
  "default",
  "defer",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "get",
  "global",
  "if",
  "implements",
  "import",
  "in",
  "infer",
  "instanceof",
  "interface",
  "intrinsic",
  "is",
  "keyof",
  "let",
  "module",
  "namespace",
  "never",
  "new",
  "null",
  "number",
  "object",
  "of",
  "out",
  "override",
  "package",
  "private",
  "protected",
  "public",
  "readonly",
  "require",
  "return",
  "satisfies",
  "set",
  "static",
  "string",
  "super",
  "switch",
  "symbol",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "unique",
  "unknown",
  "using",
  "var",
  "void",
  "while",
  "with",
  "yield",
];
