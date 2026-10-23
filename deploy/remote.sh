#!/usr/bin/env bash
set -euo pipefail

env_name="${1:?usage: remote.sh <staging|production> <image> <tag>}"
image="${2:?image required}"
tag="${3:?tag required}"
: "${VPS_HOST:?}" "${VPS_USER:?}" "${VPS_SSH_KEY:?}" "${APP_NAME:?}" "${BASE_DOMAIN:?}" "${GHCR_USER:?}" "${GHCR_TOKEN:?}"

[[ "$env_name" =~ ^(staging|production)$ ]] || { echo "invalid environment" >&2; exit 2; }
[[ "$APP_NAME" =~ ^[a-z0-9][a-z0-9-]*$ ]] || { echo "invalid APP_NAME" >&2; exit 2; }
[[ "$BASE_DOMAIN" =~ ^[a-z0-9.-]+$ ]] || { echo "invalid BASE_DOMAIN" >&2; exit 2; }
[[ "$image" =~ ^[a-z0-9./_-]+$ ]] || { echo "invalid image" >&2; exit 2; }
[[ "$tag" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "invalid tag" >&2; exit 2; }
[[ "$GHCR_USER" =~ ^[A-Za-z0-9-]+$ ]] || { echo "invalid GHCR_USER" >&2; exit 2; }
commit="${COMMIT_SHA:-$tag}"
[[ "$commit" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "invalid COMMIT_SHA" >&2; exit 2; }

here="$(cd "$(dirname "$0")" && pwd)"
key="$(mktemp)"
trap 'rm -f "$key"' EXIT
printf '%s\n' "$VPS_SSH_KEY" > "$key"
chmod 600 "$key"
mkdir -p ~/.ssh
ssh-keyscan -H "$VPS_HOST" >> ~/.ssh/known_hosts 2>/dev/null

target="$VPS_USER@$VPS_HOST"
remote_dir="/tmp/deploy-$APP_NAME-$env_name-$tag"
ssh_() { ssh -i "$key" -o BatchMode=yes "$target" "$@"; }

ssh_ "mkdir -p $remote_dir"
scp -q -i "$key" -o BatchMode=yes "$here/deploy.sh" "$here/docker-compose.yml" "$target:$remote_dir/"
printf '%s' "$GHCR_TOKEN" | ssh_ "docker login ghcr.io -u $GHCR_USER --password-stdin" >/dev/null

set +e
out="$(ssh_ "APP_NAME=$APP_NAME BASE_DOMAIN=$BASE_DOMAIN COMMIT_SHA=$commit bash $remote_dir/deploy.sh $env_name $image $tag" 2>&1 | tee /dev/stderr)"
status=$?
set -e

ssh_ "docker logout ghcr.io >/dev/null; rm -rf $remote_dir" || true

printf '%s\n' "$out" | sed -n 's/^DEPLOY_RESULT //p' | tail -1 > deploy-record.json
if [ ! -s deploy-record.json ]; then
  printf '{"environment":"%s","commitSha":"%s","imageTag":"%s","url":"https://%s","healthCheck":"fail"}\n' \
    "$env_name" "$commit" "$tag" "$([ "$env_name" = staging ] && echo "$APP_NAME.staging.$BASE_DOMAIN" || echo "$APP_NAME.$BASE_DOMAIN")" > deploy-record.json
fi
cat deploy-record.json
exit "$status"
