#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
    echo "Install Node.js with npm before starting Surf King." >&2
    exit 1
fi

if [[ ! -x node_modules/.bin/react-scripts ]]; then
    if ! command -v yarn >/dev/null; then
        echo "Install Yarn Classic to set up Surf King's dependencies." >&2
        exit 1
    fi
    yarn install --frozen-lockfile
fi

export HOST=127.0.0.1
export PORT="${PORT:-3002}"
export BROWSER="${BROWSER:-none}"

exec npm start
