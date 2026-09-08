# [Choice] Node.js version: 24, 22, 20
ARG VARIANT=24-bullseye
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# Pre-install bun so the first `npm start` doesn't pay a network install cost.
# (activepieces' own tools/scripts/install-bun.js will install it anyway if
# this is skipped — this is a speed optimization, not a requirement.)
RUN npm i -g bun@1.4.0
