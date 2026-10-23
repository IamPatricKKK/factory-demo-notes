#!/usr/bin/env bash
set -uo pipefail

env_name="${1:?usage: deploy.sh <staging|production> <image> <tag>}"
image="${2:?image required}"
tag="${3:?tag required}"
: "${APP_NAME:?APP_NAME required}" "${BASE_DOMAIN:?BASE_DOMAIN required}"

[[ "$APP_NAME" =~ ^[a-z0-9][a-z0-9-]*$ ]] || { echo "invalid APP_NAME" >&2; exit 2; }
[[ "$BASE_DOMAIN" =~ ^[a-z0-9.-]+$ ]] || { echo "invalid BASE_DOMAIN" >&2; exit 2; }
[[ "$image" =~ ^[a-z0-9./_-]+$ ]] || { echo "invalid image" >&2; exit 2; }
[[ "$tag" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "invalid tag" >&2; exit 2; }

case "$env_name" in
  staging) host="$APP_NAME.staging.$BASE_DOMAIN" ;;
  production) host="$APP_NAME.$BASE_DOMAIN" ;;
  *) echo "invalid environment: $env_name" >&2; exit 2 ;;
esac

project="$APP_NAME-$env_name"
dir="${APPS_DIR:-/opt/apps}/$project"
backups="${BACKUPS_DIR:-/opt/backups}/$APP_NAME"
commit="${COMMIT_SHA:-$tag}"
mkdir -p "$dir"
cp "$(cd "$(dirname "$0")" && pwd)/docker-compose.yml" "$dir/docker-compose.yml"
cd "$dir" || exit 1

dc() { env -u APP_NAME -u APP_HOST -u IMAGE -u IMAGE_TAG -u POSTGRES_PASSWORD docker compose -p "$project" "$@"; }

env_value() { [ -f .env ] && sed -n "s/^$1=//p" .env | tail -1; }
password="$(env_value POSTGRES_PASSWORD)"
[ -n "$password" ] || password="$(openssl rand -hex 24)"
previous="$(env_value IMAGE_TAG)"

result() {
  local rolled=""
  [ -n "${2:-}" ] && rolled=",\"rolledBackTo\":\"$2\""
  printf 'DEPLOY_RESULT {"environment":"%s","commitSha":"%s","imageTag":"%s","url":"https://%s","healthCheck":"%s"%s}\n' \
    "$env_name" "$commit" "$tag" "$host" "$1" "$rolled"
}

write_env() {
  (umask 077; printf 'APP_NAME=%s\nAPP_HOST=%s\nIMAGE=%s\nIMAGE_TAG=%s\nPOSTGRES_PASSWORD=%s\n' \
    "$project" "$host" "$image" "$1" "$password" > .env)
}

up() {
  write_env "$1"
  dc pull -q --ignore-pull-failures && dc up -d --wait --wait-timeout "${WAIT_TIMEOUT:-180}"
}

healthy() {
  for _ in $(seq 1 "${HEALTH_RETRIES:-30}"); do
    if curl -fsS --max-time 10 ${CURL_OPTS:-} --resolve "$host:443:127.0.0.1" "https://$host/api/health" >/dev/null \
      && curl -fsS --max-time 10 ${CURL_OPTS:-} --resolve "$host:443:127.0.0.1" "https://$host/" | grep -q 'id="root"'; then
      return 0
    fi
    sleep "${HEALTH_DELAY:-5}"
  done
  return 1
}

if [ "$env_name" = production ] && dc ps --status running --services 2>/dev/null | grep -qx db; then
  mkdir -p "$backups"
  file="$backups/$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
  if ! dc exec -T db pg_dump -U app app | gzip > "$file"; then
    rm -f "$file"
    echo "database backup failed, deploy aborted" >&2
    result fail
    exit 1
  fi
  ls -1t "$backups"/*.sql.gz | tail -n +11 | xargs -r rm --
  echo "backup: $file"
fi

if up "$tag" && healthy; then
  result pass
  exit 0
fi

if [ -n "$previous" ] && [ "$previous" != "$tag" ]; then
  echo "deploy of $tag failed, rolling back to $previous" >&2
  up "$previous" && healthy || echo "rollback to $previous is unhealthy too" >&2
  result fail "$previous"
else
  result fail
fi
exit 1
