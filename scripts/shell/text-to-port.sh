#!/bin/bash
#
# # text-to-port 🔌
#
# text-to-port.sh <text>
#
# Derives a stable default port from a project name, so no two applications
# need a hand-picked port and none ever collides with a framework default
# such as 3000 or 8080.
#
# ## The convention 📐
#
# Fold the characters of the text into a rolling hash, reducing mod 9000 at
# every step, then shift the result into the range 1000-9999:
#
#     h = 0
#     for each character c:  h = (h * 31 + code(c)) mod 9000
#     port = h + 1000
#
# - Order matters: each character is weighted by a power of 31 that depends
#   on its position, so `lexico-web` and `web-lexico` differ.
# - Every port from 1000 to 9999 is reachable and evenly weighted: 31 shares
#   no factor with 9000 (2^3 * 3^2 * 5^3), so each step is a bijection on the
#   residues and cannot favor multiples of 2, 3, or 5.
# - Reducing at every step keeps the arithmetic far below 2^53, so it works
#   unchanged in Bash, TypeScript, or any other language.
# - Deterministic: the same text always yields the same port.
#
# Different texts can still collide, because 9000 ports cannot cover every
# name. Check the other projects' ports before adopting a new one.
#
# ## Examples 📝
#
# `text-to-port.sh lexico-api`   # 5003
# `text-to-port.sh lexico-web`   # 7797

set -euo pipefail

readonly MULTIPLIER=31
readonly PORT_COUNT=9000
readonly PORT_MINIMUM=1000

if [[ $# -ne 1 || -z "$1" ]]; then
  echo 'Usage: text-to-port.sh <text>' >&2
  exit 1
fi

# Iterate bytes, not locale characters, so the result never depends on the
# caller's locale.
export LC_ALL=C

text="$1"
hash=0

for ((index = 0; index < ${#text}; index++)); do
  code=$(printf '%d' "'${text:index:1}")
  hash=$(((hash * MULTIPLIER + code) % PORT_COUNT))
done

echo $((hash + PORT_MINIMUM))
