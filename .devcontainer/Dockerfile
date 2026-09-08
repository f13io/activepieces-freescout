# [Choice] Node.js version: 24, 22, 20
ARG VARIANT=24-bullseye
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# Pre-install bun so the first `npm start` doesn't pay a network install cost.
# (activepieces' own tools/scripts/install-bun.js will install it anyway if
# this is skipped — this is a speed optimization, not a requirement.)
RUN npm i -g bun@1.4.0

# Pin deliberately. Bump this to pull a newer upstream activepieces version,
# then rebuild the container.
ARG ACTIVEPIECES_REF=a3d1466b1c85643d0cdd38013cc96815f762442a

# Cloned at build time (baked into the image), not at container start.
# Turborepo's workspace discovery rejects a workspace package whose real
# path resolves outside the monorepo root — which is what a runtime symlink
# from a bind-mounted repo would be. Cloning here means /home/node/activepieces
# already exists as a real directory before devcontainer.json's `mounts`
# bind-mounts this piece's repo directly onto its path inside that tree, so
# it's never a symlink at all.
USER node
RUN git clone https://github.com/activepieces/activepieces.git /home/node/activepieces \
  && git -C /home/node/activepieces checkout ${ACTIVEPIECES_REF}
