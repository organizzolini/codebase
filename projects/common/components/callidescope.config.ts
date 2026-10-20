import { projectDefaults } from "../../../configuration/callidescope.config.js";

/**
 * What components is held to, measured rather than assumed.
 *
 * Three frames and seven callees, which is what a React component library
 * measures: nothing calls deeply, and a composed component calls widely.
 *
 * Measured by a run scoped to this project and its dependency closure, and set
 * **at** what it measured rather than above it: a stack at the limit passes, so
 * this gate is green the day it arrives and the number is a starting point to
 * ratchet down from rather than a target to grow into.
 *
 * @see configuration/callidescope.config.ts — `projectDefaults`, spread below
 * for everything this file does not override
 */
export default {
  ...projectDefaults,
  // Vendored shadcn and ReUI source, refreshed by `shadcn add` rather than
  // authored here, so its call stacks are not this project's to gate.
  exclude: ["src/components/**", "src/hooks/**", "src/lib/**"],
  limits: {
    maximumBreadth: 7,
    maximumDepth: 3,
  },
};
