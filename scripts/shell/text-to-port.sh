#!/bin/bash
#
# # text-to-port 🔌
#
# text-to-port.sh <text>
#
# Derives a stable default port (1000-9999) from a project name:
#
#     h = 0; for each character c: h = (h * 31 + code(c)) mod 9000
#     port = h + 1000
#
# Order matters, and every port is equally likely because 31 shares no factor
# with 9000, which makes each step a bijection. Different names can still
# collide, so check the other projects' ports before adopting one.
#
# Example: `text-to-port.sh lexico-web` prints 7797

set -euo pipefail

if [[ $# -ne 1 || -z "$1" ]]; then
  echo 'Usage: text-to-port.sh <text>' >&2
  exit 1
fi

export LC_ALL=C # hash bytes, so the result never depends on locale

text="$1"
hash=0
for ((i = 0; i < ${#text}; i++)); do
  hash=$(((hash * 31 + $(printf '%d' "'${text:i:1}")) % 9000))
done

echo $((hash + 1000))
