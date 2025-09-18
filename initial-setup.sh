#!/bin/bash

# This script will run the create-admin, create-officials, and import-geojson scripts only once.

# Check if an admin user already exists
if ts-node -e 'import db from "./src/db/db"; db.appUser.findFirst({ where: { role: "DistrictCommittee" } }).then(admin => process.exit(admin ? 1 : 0))'; then
  echo "No admin user found. Performing one-time setup..."
  npm run create-admin
  npm run create-officials
  npm run import-geojson
  echo "One-time setup complete."
else
  echo "Admin user already exists. Skipping one-time setup."
fi
