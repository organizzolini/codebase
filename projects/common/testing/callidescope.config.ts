import { projectDefaults } from "../../../configuration/callidescope.config.js";

/**
 * What the shared test code is held to, measured rather than assumed.
 *
 * Every path in this project has a `testing` segment, which callidescope
 * reads as test scaffolding, so with the workspace defaults the gate would
 * read none of the project's own code. Counting tests as entry points is what
 * lets it read the package at all; its helpers have no other callers inside
 * the project.
 *
 * Measured by a run scoped to this project and its dependency closure, and set
 * **at** what it measured: seven frames, a test reaching through the database
 * testing module into the persistence package, and eight direct callees at the
 * widest.
 *
 * @see configuration/callidescope.config.ts — `projectDefaults`, spread below
 * for everything this file does not override
 */
export default {
  ...projectDefaults,
  entryPoints: { ...projectDefaults.entryPoints, includeTests: true },
  limits: {
    maximumBreadth: 8,
    maximumDepth: 7,
  },
};
