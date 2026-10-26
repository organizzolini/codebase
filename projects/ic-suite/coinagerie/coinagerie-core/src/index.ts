// 📤 Exports

export {
  COINAGERIE_EMOJI,
  COINAGERIE_END_ANCHOR,
  COINAGERIE_HEADING,
  COINAGERIE_START_ANCHOR,
  ConfigurationFileNotFoundError,
  InvalidConfigurationError,
  MalformedGlossaryError,
} from "./modules/coinagerie-core/coinagerie-core.constants";

export { CoinagerieCoreModule } from "./modules/coinagerie-core/coinagerie-core.module";

export { CoinagerieCoreService } from "./modules/coinagerie-core/coinagerie-core.service";
export type {
  Glossary,
  GlossaryDifference,
  GlossaryFormat,
  MalformedGlossaryLocation,
  VocabularyReport,
} from "./modules/coinagerie-core/coinagerie-core.types";
