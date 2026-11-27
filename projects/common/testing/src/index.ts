// 📤 Exports
export type { ApplicationBundleExpectations } from "./modules/application-bundle/application-bundle.types";
export { describeApplicationBundle } from "./modules/application-bundle/application-bundle.utilities";
export type { CapturedOutput } from "./modules/capture/capture.types";
export {
  captureExitCode,
  captureOutput,
  expectProcessExitOne,
  mockProcessExit,
} from "./modules/capture/capture.utilities";
export { DEFAULT_TEST_DATE } from "./modules/clock/clock.constants";
export { mockDates } from "./modules/clock/clock.utilities";
export { overrideEnvironment } from "./modules/environment/environment.utilities";
export { FakeProcessRunner } from "./modules/fake-process-runner/fake-process-runner.service";
export type {
  FakeProcessResult,
  RecordedCall,
  ScriptedAnswer,
  ScriptedEffect,
} from "./modules/fake-process-runner/fake-process-runner.types";
export {
  failed,
  succeeded,
} from "./modules/fake-process-runner/fake-process-runner.utilities";
export type {
  FileSystemFunctions,
  FileSystemMock,
} from "./modules/file-system-mock/file-system-mock.types";
export { mockFileSystem } from "./modules/file-system-mock/file-system-mock.utilities";
export type { FileTreeOptions } from "./modules/file-tree/file-tree.types";
export {
  createFileTree,
  writeFileTree,
} from "./modules/file-tree/file-tree.utilities";
export { loadFixture } from "./modules/file-tree/modules/fixtures/fixtures.utilities";
export { promptsMock } from "./modules/mocks/mocks.constants";
export type {
  ChildProcessMock,
  ExecFileExit,
  ExecFileMock,
  ExecFileParameters,
  ExecFileStart,
  PromptAnswers,
} from "./modules/mocks/mocks.types";
export {
  answerPrompts,
  mockChildProcess,
  mockExecFile,
  mockPartially,
  processFailure,
  stubFetch,
} from "./modules/mocks/mocks.utilities";
export { useWorkingDirectory } from "./modules/temporary-directory/modules/working-directory/working-directory.utilities";
export { TEMPORARY_DIRECTORY_PREFIX } from "./modules/temporary-directory/temporary-directory.constants";
export {
  createTemporaryDirectory,
  useTemporaryDirectory,
} from "./modules/temporary-directory/temporary-directory.utilities";
