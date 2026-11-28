#!/usr/bin/env sh
# Backs up the database and the fabric photos into deploy/backups/, keeping the last 14 days.
# Run from the deploy folder, e.g. daily with cron:
#   15 3 * * * cd /opt/almostafa-shop/deploy && ./backup.sh >> backups/backup.log 2>&1
set -eu
cd "$(dirname "$0")"
mkdir -p backups
stamp=$(date +%Y-%m-%d_%H%M)

docker compose exec -T db pg_dump -U almostafa -d almostafa --format=custom > "backups/db_$stamp.dump"
docker run --rm -v almostafa_uploads:/data:ro -v "$PWD/backups:/backup" alpine \
  tar czf "/backup/uploads_$stamp.tar.gz" -C /data .

find backups -name 'db_*.dump' -mtime +14 -delete
find backups -name 'uploads_*.tar.gz' -mtime +14 -delete
echo "$(date -Iseconds) backup ok: db_$stamp.dump uploads_$stamp.tar.gz"
