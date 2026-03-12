#!/usr/bin/env bash
set -euo pipefail

branch_name="${1:-}"

if [[ -z "${branch_name}" ]]; then
  branch_name="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
fi

if [[ -z "${branch_name}" || "${branch_name}" == "HEAD" ]]; then
  echo "ERROR: cannot determine branch name."
  echo "Pass branch name explicitly: scripts/git/check-branch-name.sh <branch-name>"
  exit 1
fi

if [[ "${branch_name}" == "main" || "${branch_name}" == "stage" ]]; then
  exit 0
fi

if [[ "${branch_name}" =~ ^[a-z0-9._-]+/[a-z0-9._-]+$ ]]; then
  exit 0
fi

echo "ERROR: invalid branch name: ${branch_name}"
echo "Allowed patterns:"
echo "  - main"
echo "  - stage"
echo "  - <type>/<short-name>"
echo "Example:"
echo "  - feat/request-logging"
exit 1
