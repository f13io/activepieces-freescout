#!/bin/bash
set -euo pipefail

ACTIVEPIECES_DIR="$HOME/activepieces"
PIECE_NAME="freescout"

# The piece is bind-mounted directly onto its path inside the cloned
# monorepo by devcontainer.json's `mounts` — nothing to link here.

ENV_FILE="$ACTIVEPIECES_DIR/.env.dev"
if ! grep -q "AP_DEV_PIECES=\"$PIECE_NAME\"" "$ENV_FILE" 2>/dev/null; then
  sed -i "s/^AP_DEV_PIECES=.*/AP_DEV_PIECES=\"$PIECE_NAME\"/" "$ENV_FILE"
  echo "Set AP_DEV_PIECES=\"$PIECE_NAME\" in .env.dev"
fi

cd "$ACTIVEPIECES_DIR"
node tools/setup-dev.js

echo ""
echo "Setup complete. Run: cd $ACTIVEPIECES_DIR && npm start"
