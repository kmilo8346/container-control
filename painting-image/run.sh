#!/bin/sh
set -eu
case "${IMAGE_URL:-}" in
  https://*) ;;
  *) printf 'PAINTING_ERROR:IMAGE_URL must be an HTTPS image URL\n' >&2; exit 1 ;;
esac
work=$(mktemp -d)
child=''
shutdown() {
  if [ -n "$child" ]; then
    kill "$child" 2>/dev/null || true
    wait "$child" 2>/dev/null || true
  fi
  rm -rf "$work"
  exit 0
}
trap shutdown TERM INT
trap 'rm -rf "$work"' EXIT
curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' \
  --connect-timeout 10 --max-time 60 --max-filesize 20000000 "$IMAGE_URL" -o "$work/image" &
child=$!
wait "$child"
child=''
chafa --format symbols --colors full --size 100x60 --symbols vhalf --optimize 0 "$work/image" > "$work/art"
printf 'PAINTING_START\n'
while IFS= read -r line || [ -n "$line" ]; do
  printf '%s\n' "$line"
  sleep 0.08 &
  child=$!
  wait "$child"
  child=''
done < "$work/art"
printf 'PAINTING_END\n'
while true; do
  sleep 3600 &
  child=$!
  wait "$child"
  child=''
done
