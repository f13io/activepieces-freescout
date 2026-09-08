# activepieces-freescout

An [Activepieces](https://www.activepieces.com/) custom piece for [FreeScout](https://freescout.net/), a self-hosted help desk / shared mailbox.

> This piece, its devcontainer setup, and this repo were built with AI assistance (Claude Code). Contributions and review are welcome the same as any other project.

## What's included

Actions:

- **Find Customer by Email** — looks up an existing customer by email; returns `found: false` if there's no match, so a flow can branch before creating a duplicate.
- **Create Customer**
- **Update Customer**
- **Create Conversation** — starts a new conversation with an initial message from the customer, an agent reply, or an internal note.
- **Create Thread (Reply / Note)** — adds a reply or note to an existing conversation.
- **Custom API Call** — fallback for any FreeScout endpoint not covered above.

Auth is a FreeScout instance URL + API key (`X-FreeScout-API-Key` header), since FreeScout is self-hosted rather than a single cloud API. Requires the **API & Webhooks** module installed on the FreeScout instance to get an API key (Manage » API & Webhooks).

Triggers are not built yet (planned: webhook-based `New Conversation` / `New Customer Reply` / `New Note`, backed by FreeScout's native webhook subscription API).

## Code Mirrors
Source code is automatically pushed to the following mirrors. **Note that issues and pull requests should be issued on the [main forge](https://git.f13.io/f13-dev/activepieces-freescout).**

[![Static Badge](https://img.shields.io/badge/git.F13.io-main_forge-8A2BE2?logo=forgejo&logoColor=white)](https://git.f13.io/f13-dev/activepieces-freescout) [![Open Issues](https://git.f13.io/f13-dev/activepieces-freescout/badges/issues/open.svg)](https://git.f13.io/f13-dev/activepieces-freescout/issues) [![Open Pulls](https://git.f13.io/f13-dev/activepieces-freescout/badges/pulls/open.svg)](https://git.f13.io/f13-dev/activepieces-freescout/pulls)

[![Static Badge](https://img.shields.io/badge/GitHub-mirror_and_actions-white?logo=github&logoColor=white)](https://github.com/f13io/activepieces-freescout)


## Developing

This repo holds just the piece's source. Activepieces pieces build inside the framework's own monorepo, so a devcontainer is set up to clone that monorepo (pinned to a known-good commit) and wire this piece in automatically — you don't need to set any of that up by hand.

### Using VS Code

1. Install [Docker](https://www.docker.com/) and the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) VS Code extension.
2. Open this folder in VS Code, then `Ctrl+Shift+P` → **Dev Containers: Reopen in Container**.
3. Once setup finishes, open a terminal in the container and run:
   ```sh
   cd ~/activepieces && npm start
   ```
4. Open `localhost:4200` and sign in with `dev@ap.com` / `12345678`.

### Without VS Code

Install the [devcontainers CLI](https://github.com/devcontainers/cli) (`npm i -g @devcontainers/cli`), then from this folder:

```sh
devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . bash -lc "cd ~/activepieces && npm start"
```

### Bumping the pinned Activepieces version

`.devcontainer/Dockerfile` clones activepieces at a specific commit (`ACTIVEPIECES_REF` build arg near the top of the file). The clone is baked into the image at build time — bind-mounting this piece's repo directly onto a path inside a runtime symlink target doesn't work, since Turborepo's workspace discovery rejects a workspace package whose real path resolves outside the monorepo root. Bump the ref deliberately when you want a newer upstream version, then rebuild the container.

## Testing changes

This piece's repo is bind-mounted directly onto its path inside the cloned monorepo (`devcontainer.json`'s `mounts`), so edits here trigger the framework's own hot-reload — watch for `Changes are ready! Please refresh the frontend.` in the `npm start` output, then refresh the flow builder.

**Note:** adding a *new* action or trigger name (not just editing an existing one) requires restarting `npm start`. The execution engine caches loaded piece modules in memory and only picks up new exports on restart — editing an existing action's logic hot-reloads fine, but a brand-new action name won't be runnable until you restart.

## References

- [FreeScout API docs](https://api-docs.freescout.net/)
- [Activepieces piece-building docs](https://www.activepieces.com/docs/developers)
