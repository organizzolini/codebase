// ♟️ Constants

/** Message for an override flag with nothing declared to override. */
export const buildUndeclaredOverrideMessage = (args: {
  field: string;
  flag: string;
}): string =>
  `${args.flag} overrides a value the configuration does not declare. Add \`${args.field}\` to the configuration this run reads, then use ${args.flag} to change it.`;
