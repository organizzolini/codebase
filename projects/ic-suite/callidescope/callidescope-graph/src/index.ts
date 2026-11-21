// 📤 Exports
export { AddressService } from "./modules/callables/address.service";
export type {
  CallableAddressCandidate,
  CallableAddressResolution,
  ResolveAddressArguments,
  UnresolvedCallableAddress,
} from "./modules/callables/address.types";
export { CallableIdentityService } from "./modules/callables/callable-identity.service";
export { ANONYMOUS_MEMBER_NAME } from "./modules/callables/callables.constants";
export { CallablesModule } from "./modules/callables/callables.module";
export { CallablesService } from "./modules/callables/callables.service";
export type {
  CallableCollection,
  CallableDeclaration,
  CollectCallablesArguments,
  DescribeCallableArguments,
  DiscoveredCallable,
} from "./modules/callables/callables.types";
export { MAXIMUM_IMPLEMENTATION_CANDIDATES } from "./modules/classes/classes.constants";
export { ClassesModule } from "./modules/classes/classes.module";
export { ClassesService } from "./modules/classes/classes.service";
export type {
  BuildHierarchyArguments,
  ImplementationLookup,
} from "./modules/classes/classes.types";
export { ExternalService } from "./modules/classes/external.service";
export { DEPRECATED_TAG } from "./modules/documentation/documentation.constants";
export { DocumentationModule } from "./modules/documentation/documentation.module";
export { DocumentationService } from "./modules/documentation/documentation.service";
export type { ReadDocumentationArguments } from "./modules/documentation/documentation.types";
export { CallSitesService } from "./modules/edges/call-sites.service";
export {
  COMPUTED_MEMBER_CALL,
  DYNAMIC_CALL,
  EXTERNAL_CALL,
  NO_IMPLEMENTATION_CALL,
  NO_SYMBOL_CALL,
  TOO_MANY_IMPLEMENTATIONS_CALL,
} from "./modules/edges/edges.constants";
export { EdgesModule } from "./modules/edges/edges.module";
export { EdgesService } from "./modules/edges/edges.service";
export type {
  BuildEdgesArguments,
  CallSite,
  EdgeCollection,
  ResolvedCallSite,
} from "./modules/edges/edges.types";
export { SymbolResolutionService } from "./modules/edges/symbol-resolution.service";
export {
  BARREL_FILE_SUFFIX,
  BOOTSTRAP_FILE_SUFFIX,
  BOOTSTRAP_FUNCTION_NAMES,
  COMMAND_RUNNER_METHOD_NAME,
  LIFECYCLE_METHOD_NAMES,
} from "./modules/entries/entries.constants";
export { EntriesModule } from "./modules/entries/entries.module";
export { EntriesService } from "./modules/entries/entries.service";
export type {
  EntryPointCollection,
  ResolveEntriesArguments,
  UnresolvedEntryPointAddress,
} from "./modules/entries/entries.types";
export { GraphAssemblyService } from "./modules/graph/graph-assembly.service";
export type {
  AssembledGraph,
  AssembleGraphArguments,
} from "./modules/graph/graph-assembly.types";
export { GraphModule } from "./modules/graph/graph.module";
export { GraphService } from "./modules/graph/graph.service";
export type {
  BreadthMeasurement,
  CallableBreadth,
  CallableDirectCalls,
  CallableReference,
  CallGraph,
  ComponentDepth,
  CondensedGraph,
  DepthMeasurement,
  MeasureBreadthArguments,
  MeasureDepthArguments,
} from "./modules/graph/graph.types";
export { MAXIMUM_CALL_ADDRESS_STACKS } from "./modules/graph/modules/measurement/address-depth.constants";
export { AddressDepthService } from "./modules/graph/modules/measurement/address-depth.service";
export type {
  BuildCallAddressStacksArguments,
  CallAddressStack,
  CallAddressTreeResult,
} from "./modules/graph/modules/measurement/address-depth.types";
export { BreadthService } from "./modules/graph/modules/measurement/breadth.service";
export { GraphDepthService } from "./modules/graph/modules/measurement/graph-depth.service";
export { INITIAL_LOW_LINK } from "./modules/graph/modules/traversal/components.constants";
export { ComponentsService } from "./modules/graph/modules/traversal/components.service";
export type {
  TarjanState,
  TraversalFrame,
} from "./modules/graph/modules/traversal/components.types";
export { PathsService } from "./modules/graph/modules/traversal/paths.service";
export { CompilerHostService } from "./modules/program/compiler-host.service";
export { ProgramConfigurationError } from "./modules/program/program.constants";
export { ProgramModule } from "./modules/program/program.module";
export { ProgramService } from "./modules/program/program.service";
export type {
  BuildProgramsArguments,
  ProgramSet,
  ProjectProgram,
} from "./modules/program/program.types";
export { SIGNATURE_FORMAT_FLAGS } from "./modules/signatures/signatures.constants";
export { SignaturesModule } from "./modules/signatures/signatures.module";
export { SignaturesService } from "./modules/signatures/signatures.service";
export type { ReadSignatureArguments } from "./modules/signatures/signatures.types";
export { FileFilterService } from "./modules/workspace/file-filter.service";
export {
  EXCLUDED_SCAN_DIRECTORY_NAMES,
  TEST_DIRECTORY_SEGMENT,
  TEST_FILE_PATTERN,
} from "./modules/workspace/workspace.constants";
export { WorkspaceModule } from "./modules/workspace/workspace.module";
export { WorkspaceService } from "./modules/workspace/workspace.service";
export type {
  BuildExclusionsArguments,
  BuildProjectFileFilterArguments,
  DiscoverProjectsArguments,
  FileFilter,
  WorkspaceProject,
} from "./modules/workspace/workspace.types";
