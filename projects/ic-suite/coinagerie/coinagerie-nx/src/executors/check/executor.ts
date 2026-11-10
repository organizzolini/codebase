// 🛠️ Utilities

import { runGroup } from "./executor.utilities";

import type {
  CheckExecutorContext,
  CheckExecutorOptions,
} from "./executor.types";

/**
 * Judges one project's glossaries against its code's words.
 * Inferred onto every configured project, so `nx affected` judges only touched projects.
 */
export default async function checkExecutor(
  options: CheckExecutorOptions,
  context: CheckExecutorContext,
): Promise<{ success: boolean }> {
  const projectName = context.projectName;

  if (projectName === undefined) {
    throw new Error(
      "The coinagerie check executor must be run against a project.",
    );
  }

  const projectConfiguration =
    context.projectsConfigurations.projects[projectName];

  if (projectConfiguration === undefined) {
    throw new Error(`Unknown project: ${projectName}.`);
  }

  const outcomes = Object.values(
    await runGroup({
      group: {
        command: options.command,
        mode: options.write === true ? "write" : "check",
        tasks: [{ directory: projectConfiguration.root, id: projectName }],
      },
      root: context.root,
    }),
  );

  process.stdout.write(
    `${outcomes.map(({ terminalOutput }) => terminalOutput).join("\n")}\n`,
  );

  return { success: outcomes.every(({ success }) => success) };
}
