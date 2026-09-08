#!/bin/bash
set -euo pipefail

# Pin deliberately. Bump this when you want a newer upstream activepieces
# version, then rebuild the container.
ACTIVEPIECES_REF="a3d1466b1c85643d0cdd38013cc96815f762442a"

ACTIVEPIECES_DIR="$HOME/activepieces"
PIECE_NAME="freescout"
PIECE_LINK="$ACTIVEPIECES_DIR/packages/pieces/custom/$PIECE_NAME"

if [ ! -d "$ACTIVEPIECES_DIR" ]; then
  echo "Cloning activepieces @ $ACTIVEPIECES_REF..."
  git clone https://github.com/activepieces/activepieces.git "$ACTIVEPIECES_DIR"
  git -C "$ACTIVEPIECES_DIR" checkout "$ACTIVEPIECES_REF"
fi

if [ ! -L "$PIECE_LINK" ]; then
  rm -rf "$PIECE_LINK"
  ln -s /workspace "$PIECE_LINK"
  echo "Linked /workspace -> $PIECE_LINK"
fi

ENV_FILE="$ACTIVEPIECES_DIR/.env.dev"
if ! grep -q "AP_DEV_PIECES=\"$PIECE_NAME\"" "$ENV_FILE" 2>/dev/null; then
  sed -i "s/^AP_DEV_PIECES=.*/AP_DEV_PIECES=\"$PIECE_NAME\"/" "$ENV_FILE"
  echo "Set AP_DEV_PIECES=\"$PIECE_NAME\" in .env.dev"
fi

cd "$ACTIVEPIECES_DIR"
node tools/setup-dev.js

echo ""
echo "Setup complete. Run: cd $ACTIVEPIECES_DIR && npm start"
