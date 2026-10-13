// Declares `!configuration` on every other project, so the files it owns are
// never a dependency of the projects that import them.
const path = require("node:path");

const CONFIGURATION_ROOT = "projects/configuration";

module.exports = {
  createNodesV2: [
    "**/project.json",
    (projectFiles) =>
      projectFiles.map((projectFile) => {
        const root = path.dirname(projectFile);
        return [
          projectFile,
          root === CONFIGURATION_ROOT
            ? {}
            : {
                projects: {
                  [root]: { implicitDependencies: ["!configuration"] },
                },
              },
        ];
      }),
  ],
  name: "configuration",
};
