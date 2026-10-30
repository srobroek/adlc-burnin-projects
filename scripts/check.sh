#!/usr/bin/env bash
# Run the check of every project changed against the merge base with main.
#
#   bash scripts/check.sh           run the changed projects' checks
#   bash scripts/check.sh --list    print the slugs that would be checked
#
# A project is projects/<slug>/ with an executable-or-not check.sh entry point. Projects whose
# directory starts with "_" (projects/_faults/) are fixtures and are never checked. A change
# outside projects/ (mise.toml, scripts/, .github/) checks every project; root *.md files
# check nothing. Without a merge base (a shallow or single-branch clone) it first fetches main
# from origin, deepening as needed, and only then checks every project, saying which it did.
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

# The merge base with main. A shallow or single-branch clone may lack origin/main or the
# common ancestor: fetch main, deepen step by step, and only then give up.
refs=${BASE_REF:-origin/main main}
branch=main
case "${BASE_REF:-}" in origin/?*) branch=${BASE_REF#origin/} ;; esac

find_base() {
  local ref
  for ref in $refs; do
    if git merge-base HEAD "$ref" 2>/dev/null; then return 0; fi
  done
  return 1
}

base=$(find_base || true)
if [ -z "$base" ] && git remote get-url origin >/dev/null 2>&1; then
  echo "check: no merge base with $refs; fetching $branch from origin"
  git fetch --quiet --no-tags origin "+refs/heads/$branch:refs/remotes/origin/$branch" || true
  base=$(find_base || true)
  deepen=50
  while [ -z "$base" ] && [ "$(git rev-parse --is-shallow-repository)" = true ] && [ "$deepen" -le 800 ]; do
    echo "check: still no merge base; deepening the clone by $deepen commits"
    git fetch --quiet --no-tags --deepen="$deepen" origin "+refs/heads/$branch:refs/remotes/origin/$branch" "$(git rev-parse HEAD)" || break
    base=$(find_base || true)
    deepen=$((deepen * 4))
  done
  if [ -z "$base" ] && [ "$(git rev-parse --is-shallow-repository)" = true ]; then
    echo "check: still no merge base; fetching the full history"
    git fetch --quiet --no-tags --unshallow origin "+refs/heads/$branch:refs/remotes/origin/$branch" || true
    base=$(find_base || true)
  fi
fi

if [ -z "$base" ]; then
  echo "check: no merge base with $refs; checking every project"
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
