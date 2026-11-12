import {
  codometerConfiguration,
  compiledJavaScriptTarget,
} from "../../../configuration/codometer.config.js";

export default {
  ...codometerConfiguration,
  inputs: [
    {
      ...compiledJavaScriptTarget,
      include: ["dist/**/*.js"],
    },
  ],
  // 🎯 One rung above 192 KB, where the hardcoded historical corpus put it. The
  // ladder roughly doubles (6, 12, 32, 128, 192, 256, 384) and 256 leaves real
  // headroom; expected to shrink once ticket #819 retires the procedural motifs.
  limits: [{ metric: "Compiled JavaScript.size", value: "256 KB" }],
};
