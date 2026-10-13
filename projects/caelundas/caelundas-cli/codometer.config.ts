import {
  codometerConfiguration,
  compiledJavaScriptTarget,
} from "../../../projects/configuration/codometer.config.js";

export default {
  ...codometerConfiguration,
  inputs: [
    {
      ...compiledJavaScriptTarget,
      include: ["dist/**/*.js"],
    },
  ],
  limits: [{ metric: "Compiled JavaScript.size", value: "384 KB" }],
};
