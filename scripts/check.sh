#!/usr/bin/env bash
# Run the check of every project changed against the merge base with main.
#
#   bash scripts/check.sh           run the changed projects' checks
#   bash scripts/check.sh --list    print the slugs that would be checked
#
# A project is projects/<slug>/ with an executable-or-not check.sh entry point. Projects whose
# directory starts with "_" (projects/_faults/) are fixtures and are never checked. A change
# outside projects/ (mise.toml, scripts/, .github/) checks every project; root *.md files
# check nothing. Without a main ref to compare to (a shallow clone), every project is checked.
# BASE_REF overrides the ref compared against (default: origin/main, then main).
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

all_projects() {
  local dir
  for dir in projects/*/; do
    dir=${dir%/}
    case "${dir##*/}" in _*) continue ;; esac
    [ -d "$dir" ] && echo "${dir##*/}"
  done
}

base=""
for ref in ${BASE_REF:-origin/main main}; do
  if base=$(git merge-base HEAD "$ref" 2>/dev/null); then break; fi
  base=""
done

if [ -z "$base" ]; then
  slugs=$(all_projects)
else
  files=$( { git diff --name-only "$base"; git ls-files --others --exclude-standard; } | sort -u)
  slugs=""
  everything=0
  while IFS= read -r file; do
    [ -n "$file" ] || continue
    case "$file" in
      projects/_*) ;;
      projects/*/*) slug=${file#projects/}; slugs+="${slug%%/*}"$'\n' ;;
      */*) everything=1 ;;
      *.md) ;;
      *) everything=1 ;;
    esac
  done <<<"$files"
  if [ "$everything" = 1 ]; then slugs=$(all_projects); fi
  slugs=$(printf '%s' "$slugs" | sed '/^$/d' | sort -u)
fi

if [ "${1:-}" = "--list" ]; then
  [ -z "$slugs" ] || echo "$slugs"
  exit 0
fi

if [ -z "$slugs" ]; then
  echo "check: no project changed; nothing to check"
  exit 0
fi

failed=()
for slug in $slugs; do
  if [ ! -d "projects/$slug" ]; then
    echo "check: projects/$slug was removed; skipping"
    continue
  fi
  echo "check: projects/$slug"
  if [ ! -f "projects/$slug/check.sh" ]; then
    echo "check: projects/$slug/check.sh is missing" >&2
    failed+=("$slug")
  elif ! (cd "projects/$slug" && bash check.sh); then
    failed+=("$slug")
  fi
done

if [ "${#failed[@]}" -gt 0 ]; then
  echo "check: failed: ${failed[*]}" >&2
  exit 1
fi
echo "check: ok"
