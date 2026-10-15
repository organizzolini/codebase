import { projectDefaults } from "../../configuration/callidescope.config.js";

/**
 * What database is held to, re-measured when it became a command line as
 * well as a package, and set at what was measured.
 *
 * Seven deep: `ImportCommand.run` lists a dump through
 * `PostgresClientService.run`, whose `execFile` callback raises a
 * `PostgresClientError`. The frames below that callback run inside Node,
 * which the trace does not follow. `ExportCommand.run` reaches six down the
 * same path.
 *
 * Seven direct callees at the widest, where `ExportCommand.plan` and
 * `ImportCommand.plan` tie: each checks every option, parses the URI,
 * guards the file, qualifies the tables, and masks the URI, so nothing
 * runs against a half-specified command line.
 *
 * Measured by a run scoped to this project and its dependency closure, and
 * set **at** those numbers, so each is a starting point to ratchet down
 * from.
 *
 * @see configuration/callidescope.config.ts — `projectDefaults`, spread below
 * for everything this file does not override
 */
export default {
  ...projectDefaults,
  limits: {
    maximumBreadth: 7,
    maximumDepth: 7,
  },
};
