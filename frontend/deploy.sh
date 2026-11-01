#!/usr/bin/env bash
# Additive frontend deploy. New hashed chunks are added next to the old ones and index.html is
# swapped last, so browsers still holding an older index.html keep loading their own chunks
# instead of getting 404s. See DEPLOY.md.
#
#   frontend/deploy.sh                    build, publish into frontend/www, (re)start the container
#   frontend/deploy.sh prune              delete assets that are outside the last KEEP_GENERATIONS
#                                         builds AND not part of any build for KEEP_DAYS days
#   DRY_RUN=1 frontend/deploy.sh prune    only list what prune would delete
set -euo pipefail

FRONTEND_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$FRONTEND_DIR")"
COMPOSE_FILE="$REPO_DIR/docker-compose.prod.yml"
IMAGE=portfolio-frontend-prod
CONTAINER=portfolio-frontend-prod
WWW="$FRONTEND_DIR/www"
GENERATIONS="$FRONTEND_DIR/.deploy/generations"
KEEP_GENERATIONS="${KEEP_GENERATIONS:-3}"
KEEP_DAYS="${KEEP_DAYS:-30}"
TMP=""

compose() { docker compose -f "$COMPOSE_FILE" "$@"; }

cleanup() { [ -z "$TMP" ] || rm -rf "$TMP"; }
trap cleanup EXIT

# Copies files missing in the target and never overwrites or deletes. Files that already exist
# only get their mtime refreshed, so mtime means "last deployed in some build" for prune.
# (cp -n is not used: coreutils 9.2-9.4 exit non-zero when it skips a file, aborting set -e.)
add_missing() {
  local src=$1 dst=$2 rel
  (cd "$src" && find . -type f) | while IFS= read -r rel; do
    rel=${rel#./}
    if [ -e "$dst/$rel" ]; then
      touch -- "$dst/$rel"
    else
      mkdir -p "$(dirname "$dst/$rel")"
      cp -- "$src/$rel" "$dst/$rel"
    fi
  done
}

record_generation() {
  local build=$1 suffix=${2:-}
  mkdir -p "$GENERATIONS"
  (cd "$build/assets" && find . -type f | sed 's|^\./||' | sort) \
    > "$GENERATIONS/$(date -u +%Y%m%dT%H%M%SZ)${suffix:+-$suffix}.txt"
}

# Aborts before the swap if the new index.html points at a file that is not published
# (e.g. a /assets/assets/* path produced by a wrong Vite base).
check_entry_points() {
  local index=$1 path missing=0 found=0
  for path in $(grep -oE '(src|href)="/assets/[^"]+"' "$index" | sed -E 's/^[a-z]+="\/assets\///; s/"$//'); do
    found=1
    if [ ! -f "$WWW/assets/$path" ]; then
      echo "index.html references missing /assets/$path" >&2
      missing=1
    fi
  done
  if [ "$found" -eq 0 ]; then
    echo "index.html references no /assets/* files" >&2
    return 1
  fi
  [ "$missing" -eq 0 ]
}

# First run: keep the build that the current container still serves from its image, so users
# holding that index.html do not lose their chunks when the volume takes over.
seed_from_running_container() {
  [ ! -e "$WWW/index.html" ] || return 0
  mkdir -p "$WWW/assets"
  docker container inspect "$CONTAINER" >/dev/null 2>&1 || return 0
  echo "Seeding $WWW with the build currently served by $CONTAINER"
  local seed
  seed=$(mktemp -d)
  docker cp "$CONTAINER:/usr/share/nginx/html/." "$seed/"
  if [ -d "$seed/assets" ]; then
    add_missing "$seed/assets" "$WWW/assets"
    record_generation "$seed" seed
  fi
  [ ! -f "$seed/index.html" ] || cp -- "$seed/index.html" "$WWW/index.html"
  rm -rf "$seed"
}

deploy() {
  seed_from_running_container

  compose build frontend
  TMP=$(mktemp -d)
  local cid
  cid=$(docker create "$IMAGE")
  docker cp "$cid:/usr/share/nginx/html/." "$TMP/"
  docker rm "$cid" >/dev/null
  if [ ! -f "$TMP/index.html" ] || [ ! -d "$TMP/assets" ]; then
    echo "Built image has no index.html or assets/" >&2
    exit 1
  fi

  mkdir -p "$WWW/assets"
  add_missing "$TMP/assets" "$WWW/assets"
  # Top-level files (favicon, robots.txt) are not hashed, so the newest build wins
  find "$TMP" -maxdepth 1 -type f ! -name index.html -exec cp -- {} "$WWW/" \;
  check_entry_points "$TMP/index.html"
  record_generation "$TMP"

  # Rename within the same directory is atomic: a request sees either the old or the new file
  cp -- "$TMP/index.html" "$WWW/.index.html.new"
  mv -f -- "$WWW/.index.html.new" "$WWW/index.html"

  compose up -d frontend
  echo "Deployed $(grep -oE '/assets/index-[^"]+\.js' "$WWW/index.html" | head -n 1)"
}

prune() {
  if [ ! -d "$WWW/assets" ]; then
    echo "Nothing to prune"
    return 0
  fi
  local keep rel f
  keep=$(mktemp)
  TMP=$keep
  find "$GENERATIONS" -maxdepth 1 -type f -name '*.txt' 2>/dev/null | sort | tail -n "$KEEP_GENERATIONS" \
    | while IFS= read -r f; do cat -- "$f"; done | sort -u > "$keep"
  if [ ! -s "$keep" ]; then
    echo "No generation manifests in $GENERATIONS, refusing to prune" >&2
    exit 1
  fi

  find "$WWW/assets" -type f -mtime +"$KEEP_DAYS" | while IFS= read -r f; do
    rel=${f#"$WWW/assets/"}
    grep -qxF -- "$rel" "$keep" && continue
    if [ -n "${DRY_RUN:-}" ]; then
      echo "would delete $rel"
    else
      rm -f -- "$f"
      echo "deleted $rel"
    fi
  done

  [ -z "${DRY_RUN:-}" ] || return 0
  find "$GENERATIONS" -maxdepth 1 -type f -name '*.txt' | sort | head -n -"$KEEP_GENERATIONS" \
    | while IFS= read -r f; do rm -f -- "$f"; done
}

case "${1:-deploy}" in
  deploy) deploy ;;
  prune) prune ;;
  *) echo "Usage: $0 [deploy|prune]" >&2; exit 2 ;;
esac
