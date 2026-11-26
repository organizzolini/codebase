#!/bin/sh
# The image's start command: give the application its port, then replace this shell with Node.
# APPLICATION_PORT_VARIABLE names the variable the application reads its port from; the image sets it only when the environment has not.
set -eu
if [ -n "${APPLICATION_PORT_VARIABLE:-}" ]; then
  eval "current=\${$APPLICATION_PORT_VARIABLE:-}"
  if [ -z "$current" ]; then
    export "$APPLICATION_PORT_VARIABLE=${APPLICATION_PORT:-}"
  fi
fi
# The entry may carry arguments, such as a subcommand, so the shell splits it.
eval "exec node $APPLICATION_ENTRY"
