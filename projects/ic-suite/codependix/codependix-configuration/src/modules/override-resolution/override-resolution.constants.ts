// ♟️ Constants

/**
 * Says an override flag has nothing to override. Mirrors `@callidescope/configuration`'s
 * `buildUndeclaredValueMessage`: a flag may change a declared value, never supply an undeclared one.
 */
export const buildUndeclaredOverrideMessage = (args: {
  field: string;
  flag: string;
}): string =>
  `${args.flag} overrides a value the configuration does not declare. Add \`${args.field}\` to the configuration this run reads, then use ${args.flag} to change it.`;
