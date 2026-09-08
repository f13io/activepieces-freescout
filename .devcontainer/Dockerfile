# [Choice] Node.js version: 24, 22, 20
ARG VARIANT=24-bullseye
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# Pre-install bun so the first `npm start` doesn't pay a network install cost.
# (activepieces' own tools/scripts/install-bun.js will install it anyway if
# this is skipped — this is a speed optimization, not a requirement.)
RUN npm i -g bun@1.4.0

# Pin deliberately. Bump activepieces-ref.txt to pull a newer upstream
# activepieces version, then rebuild the container. This is also the source
# of truth for the GitHub Actions release workflow (.github/workflows/), so
# both dev and CI/publish always build against the same upstream commit.
COPY activepieces-ref.txt /tmp/activepieces-ref.txt

# Cloned at build time (baked into the image), not at container start.
# Turborepo's workspace discovery rejects a workspace package whose real
# path resolves outside the monorepo root — which is what a runtime symlink
# from a bind-mounted repo would be. Cloning here means /home/node/activepieces
# already exists as a real directory before devcontainer.json's `mounts`
# bind-mounts this piece's repo directly onto its path inside that tree, so
# it's never a symlink at all.
USER node
RUN git clone https://github.com/activepieces/activepieces.git /home/node/activepieces \
  && git -C /home/node/activepieces checkout "$(cat /tmp/activepieces-ref.txt)"
