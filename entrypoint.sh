#!/bin/bash

# The server will be started by the dev script. This script will only handle initial setup.
# It will run the create-admin, create-officials, and import-geojson scripts only once.

FLAG_FILE="/app/.setup_done"

if [ ! -f "$FLAG_FILE" ]; then
  echo "Performing one-time setup..."
  npm run create-admin
  npm run create-officials
  npm run import-geojson
  touch "$FLAG_FILE"
  echo "One-time setup complete."
fi

# Start the main process
#npm run build
npm run dev
