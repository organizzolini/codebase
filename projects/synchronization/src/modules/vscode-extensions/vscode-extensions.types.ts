// 🏷️ Types

/** One extension list of a devcontainer, set against the list the source declares. */
export interface ExtensionListDifference {
  readonly actual: string[];
  readonly expected: string[];
  readonly list: string;
  readonly relativeFilePath: string;
}

/** The slice of a devcontainer configuration this synchronization reads and writes. */
export interface VscodeExtensionsDevcontainer {
  [key: string]: unknown;
  customizations: {
    [key: string]: unknown;
    vscode: {
      [key: string]: unknown;
      extensions: string[];
      recommendations: string[];
      unwantedRecommendations: string[];
    };
  };
}

/** The two lists `.vscode/extensions.json` declares. */
export interface VscodeExtensionsFile {
  recommendations: string[];
  unwantedRecommendations: string[];
}
