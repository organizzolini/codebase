#!/usr/bin/env node
// The `conformetry-nx-bootstrap-generators` command as the published package runs it.
// Shebang and decorator metadata survive the build; runs under bare `node`.
import { runBootstrapCli } from "./modules/generator/bootstrap.utilities";

void runBootstrapCli(process.cwd());
