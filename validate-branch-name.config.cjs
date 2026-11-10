/**
 * Branch name validation: `<type>/<scope>-<description>`, built from the types and scopes in `conventional.config.cjs`.
 * Run by the `pre-push` hook.
 */
const { scopes, types } = require("./configuration/conventional.config.cjs");

const specialBranches = ["main"];
const automatedPrefixes = [
  "copilot",
  "dependabot",
  "jimmypaolini/copilot",
  "renovate",
];

// Build regex pattern
const typePattern = types.map((type) => type.name).join("|");
const scopePattern = scopes.map((scope) => scope.name).join("|");
const specialPattern = specialBranches.join("|");
const automatedPattern = automatedPrefixes
  .map((p) => String.raw`${p}\/.*`)
  .join("|");

module.exports = {
  pattern: String.raw`^((${typePattern})\/(${scopePattern})-[a-z0-9-]+|${specialPattern}|${automatedPattern})$`,
  errorMsg: `
❌ Invalid branch name

✅ Required format:
  <type>/<scope>-<description>

  Example: feat/lexico-user-auth
           fix/codebase-build-script

Special branches: ${specialBranches.join(", ")}
Automated prefixes: ${automatedPrefixes.map((p) => `${p}/*`).join(", ")}

🏷️ Valid types: ${types.map((type) => type.name).join(", ")}
🔭 Valid scopes: ${scopes.map((scope) => scope.name).join(", ")}
💡 Description: lowercase with hyphens (kebab-case)
`,
};
