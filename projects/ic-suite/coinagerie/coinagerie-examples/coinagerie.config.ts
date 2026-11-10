import { coinagerieConfiguration } from "../../../../configuration/coinagerie.config.js";

export default {
  ...coinagerieConfiguration,
  exclude: {
    ...coinagerieConfiguration.exclude,
    paths: ["examples/**"],
  },
};
