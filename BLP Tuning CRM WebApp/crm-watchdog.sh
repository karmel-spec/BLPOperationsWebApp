#!/bin/bash
# crm-watchdog.sh — Ensures the CRM API server is running on port 8900
# Restarts it if it crashed. Run every 5 minutes via cron.

PORT=8900
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="/tmp/crm-watchdog.log"

# Cron runs with a minimal PATH; gog lives in Homebrew
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Check if anything is listening on the port
if ! lsof -ti:$PORT > /dev/null 2>&1; then
  echo "[$(date)] CRM server down on port $PORT — restarting..." >> "$LOG_FILE"
  cd "$APP_DIR" && nohup python3 api_server.py > /tmp/crm-api.log 2>&1 &
  echo "[$(date)] Started PID $!" >> "$LOG_FILE"
fi
