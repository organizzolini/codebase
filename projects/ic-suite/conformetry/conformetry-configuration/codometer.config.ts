import {
  codometerConfiguration,
  compiledJavaScriptTarget,
} from "../../../../configuration/codometer.config.js";

export default {
  ...codometerConfiguration,
  inputs: [
    {
      ...compiledJavaScriptTarget,
      include: ["dist/**/*.js"],
    },
  ],
  // Raised to 32 KB for the template pickers, reserved-name rule, and group-locating rule added here.
  limits: [{ metric: "Compiled JavaScript.size", value: "32 KB" }],
};
