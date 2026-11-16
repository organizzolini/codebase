import { coinagerieConfiguration } from "../../../../../configuration/ic-suite/coinagerie.config.js";

export default {
  ...coinagerieConfiguration,
  exclude: {
    ...coinagerieConfiguration.exclude,
    paths: ["examples/**"],
  },
};
