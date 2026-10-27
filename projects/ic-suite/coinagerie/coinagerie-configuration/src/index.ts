// 📤 Exports

export {
  CONFIGURATION_FILE_NAMES,
  DEFAULT_INCLUDE,
} from "./modules/configuration/configuration.constants";

export { ConfigurationModule } from "./modules/configuration/configuration.module";

export { ConfigurationService } from "./modules/configuration/configuration.service";
export type {
  CoinagerieConfiguration,
  CoinagerieExclusions,
  CoinagerieJsonOutput,
  CoinagerieMarkdownOutput,
  CoinagerieOutput,
  ConfigurationOverrides,
  ExcludedWords,
  FoldWord,
  LoadConfigurationArguments,
  ResolvedCoinagerieConfiguration,
  ResolvedCoinagerieJsonOutput,
  ResolvedCoinagerieMarkdownOutput,
  ResolvedCoinagerieOutput,
} from "./modules/configuration/configuration.types";
