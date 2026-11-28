#!/usr/bin/env sh
# Restores a backup made by backup.sh. THIS REPLACES the current shop data with the backup.
# Usage (from the deploy folder):  ./restore.sh backups/db_YYYY-MM-DD_HHMM.dump backups/uploads_YYYY-MM-DD_HHMM.tar.gz [backups/originals_….tar.gz]
set -eu
cd "$(dirname "$0")"
db_dump=${1:?Usage: ./restore.sh <db_….dump> <uploads_….tar.gz>}
uploads=${2:?Usage: ./restore.sh <db_….dump> <uploads_….tar.gz>}
originals=${3:-}
[ -f "$db_dump" ] && [ -f "$uploads" ] || { echo "Backup file not found."; exit 1; }

if [ "${CONFIRM:-}" != "yes" ]; then
  printf 'This replaces ALL current fabrics, orders and photos with the backup. Type RESTORE to continue: '
  read -r answer
  [ "$answer" = "RESTORE" ] || { echo "Cancelled."; exit 1; }
fi

docker compose up -d db
docker compose stop api web
until docker compose exec -T db pg_isready -U almostafa -d almostafa >/dev/null 2>&1; do sleep 1; done

docker compose exec -T db pg_restore -U almostafa -d almostafa --clean --if-exists --no-owner < "$db_dump"
docker run --rm -v almostafa_uploads:/data -v "$(cd "$(dirname "$uploads")" && pwd):/backup:ro" alpine \
  sh -c "find /data -mindepth 1 -delete && tar xzf /backup/$(basename "$uploads") -C /data && chown -R 1654:1654 /data"
if [ -n "$originals" ]; then
  docker run --rm -v almostafa_originals:/data -v "$(cd "$(dirname "$originals")" && pwd):/backup:ro" alpine \
    sh -c "find /data -mindepth 1 -delete && tar xzf /backup/$(basename "$originals") -C /data && chown -R 1654:1654 /data"
fi

docker compose up -d
echo "Restore finished."
