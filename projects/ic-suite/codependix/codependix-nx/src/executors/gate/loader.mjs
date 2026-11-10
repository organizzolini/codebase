// Registers the `@swc-node/register` hooks the codependix command line runs
// under, resolved from this plugin's own dependencies. The gate hands
// `node --import` this module's file URL.

// The hook's own `esm-register` entry resolves from the working directory, which may lack
// it. Resolving from this module's URL reaches the copy this plugin depends on. The hooks
// still read `tsconfig.json` from the working directory.

// `module.register` is deprecated (DEP0205), but `registerHooks` runs only synchronous hooks,
// so swc's asynchronous ones have no replacement. If a Node release removes `register`, gates fail loudly.
import { register } from "node:module";

register("@swc-node/register/esm", import.meta.url);
