/**
 * The TypeScript configuration file. The JSON one beside it is read only when
 * `--config` names it: nothing searches a directory for a file.
 */
export default {
  include: ["packages/*", "codependix-*"],
  projectConfigurationPath: "codependix.config.ts",
  workspace: {
    nxProjects: { markdown: { anchor: "example-nx" }, target: "markdown" },
  },
};
