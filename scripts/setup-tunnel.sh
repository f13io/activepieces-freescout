#!/usr/bin/env bash
# Patches the cloned Activepieces monorepo (inside the devcontainer) so its dev server
# works behind an HTTPS tunnel, per README's "Testing a webhook trigger against a real
# FreeScout instance". Run this INSIDE the devcontainer, after starting your tunnel:
#
#   scripts/setup-tunnel.sh your-tunnel-domain.example.com
#
# Then restart `npm start` — env vars and Vite config are only read at boot.
#
# Safe to re-run: each edit replaces the whole line it targets, so running this again
# (e.g. with a new tunnel domain, or after the container/checkout is refreshed) just
# updates the domain in place rather than duplicating lines.
set -euo pipefail

# Relies on GNU sed (the devcontainer's Debian base image ships it). macOS's built-in
# BSD sed silently produces wrong results with the same flags, so fail loudly instead
# if this is somehow run outside the container.
if ! sed --version >/dev/null 2>&1; then
  echo "This needs GNU sed — run it inside the devcontainer, not on a macOS/BSD host." >&2
  exit 1
fi

DOMAIN="${1:?Usage: $0 <tunnel-domain> [path-to-activepieces-checkout]}"
AP_DIR="${2:-$HOME/activepieces}"

ENV_FILE="$AP_DIR/.env.dev"
VITE_FILE="$AP_DIR/packages/web/vite.config.mts"

for f in "$ENV_FILE" "$VITE_FILE"; do
  [ -f "$f" ] || { echo "Not found: $f (expected an activepieces checkout at $AP_DIR — pass its path as arg 2 if it's elsewhere)" >&2; exit 1; }
done

# 1. AP_FRONTEND_URL — so Activepieces generates webhook URLs pointing at the tunnel, not localhost.
sed -i -E "s#^AP_FRONTEND_URL=.*#AP_FRONTEND_URL=\"https://${DOMAIN}\"#" "$ENV_FILE"

# 2. allowedHosts — Vite rejects requests whose Host header isn't in this list.
#    Matches whether the line is present (from a prior run) or still the commented-out default.
if grep -q "allowedHosts:" "$VITE_FILE"; then
  sed -i -E "s#.*allowedHosts:.*#      allowedHosts: ['${DOMAIN}'],#" "$VITE_FILE"
else
  sed -i -E "0,/server: \{/s##server: {\n      allowedHosts: ['${DOMAIN}'],#" "$VITE_FILE"
fi

# 3. hmr wss/443 — without this, the HMR client's plain ws:// call from an HTTPS-loaded
#    page gets blocked as mixed content, causing a reload loop.
if grep -q "hmr:" "$VITE_FILE"; then
  sed -i -E "s#.*hmr:.*#      hmr: { protocol: 'wss', clientPort: 443 },#" "$VITE_FILE"
else
  sed -i -E "0,/allowedHosts:.*/s##&\n      hmr: { protocol: 'wss', clientPort: 443 },#" "$VITE_FILE"
fi

echo "Patched for tunnel domain: $DOMAIN"
echo "  $ENV_FILE"
echo "  $VITE_FILE"
echo "Restart npm start to pick up the changes."
