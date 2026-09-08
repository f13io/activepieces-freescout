# activepieces-freescout

An [Activepieces](https://www.activepieces.com/) custom piece for [FreeScout](https://freescout.net/), a self-hosted help desk / shared mailbox.

> This piece, its devcontainer setup, and this repo were built with AI assistance (Claude Code). See [AI_DISCLAIMER.md](AI_DISCLAIMER.md) for details. Contributions and review are welcome the same as any other project.

## What's included

Actions:

- **Find Customer by Email** — looks up an existing customer by email; returns `found: false` if there's no match, so a flow can branch before creating a duplicate.
- **Create Customer**
- **Update Customer**
- **Create Conversation** — starts a new conversation with an initial message from the customer, an agent reply, or an internal note.
- **Create Thread (Reply / Note)** — adds a reply or note to an existing conversation.
- **Custom API Call** — fallback for any FreeScout endpoint not covered above.

Auth is a FreeScout instance URL + API key (`X-FreeScout-API-Key` header), since FreeScout is self-hosted rather than a single cloud API. Requires the **API & Webhooks** module installed on the FreeScout instance to get an API key (Manage » API & Webhooks).

Triggers (webhook-based, backed by FreeScout's native webhook subscription API):

- **New Conversation** — fires on `convo.created`.
- **New Customer Reply** — fires on `convo.customer.reply.created`.

More event triggers (New Note, Status Changed, etc.) can be added the same way — see `src/lib/common/webhook-trigger-factory.ts`.

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

**Hot-reload does not work in the devcontainer.** The framework's own file-watcher (`dev-piece-watcher.ts`, which rebuilds the piece automatically on save) relies on inotify, which doesn't fire on this Windows Docker Desktop bind-mount — confirmed by testing edits from both the host and inside the container. This is the same root cause as the general Windows/WSL guidance elsewhere in this project: cross-filesystem-boundary file-watching is unreliable, it just resurfaces here at the devcontainer's mount layer instead of WSL's. It may not affect Mac/Linux hosts, where bind mounts don't cross an NTFS boundary.

Until that's addressed (candidate fix: clone this repo onto a native Linux filesystem — e.g. inside WSL on Windows — and open the devcontainer from there instead of from a Windows path), **restart `npm start` after every source change** to pick it up; don't wait for `Changes are ready!` in the output, since it won't appear. This applies to edits to existing actions/triggers too, not just new action/trigger names.

Separately: adding a *new* action or trigger name (not just editing an existing one) always requires a restart regardless of platform — the execution engine caches loaded piece modules in memory and only picks up new exports on restart.

### Testing a webhook trigger against a real FreeScout instance

FreeScout needs to reach the flow's webhook URL from the outside, so expose `localhost:4200` via a tunnel — any service that gives you a public HTTPS URL works (e.g. [localxpose](https://localxpose.io/), [tuns.sh](https://tuns.sh/), `ssh -R`-based tunnels, ngrok, Cloudflare Tunnel). Once you have a tunnel URL, three config changes are required inside the cloned monorepo (`~/activepieces`) before enabling a trigger — skipping any of them is the most likely cause of a "Bad Gateway", a rejected-host error, or a reload loop through the tunnel.

Run this from a terminal inside the devcontainer (it patches the checkout, not this repo):

```sh
scripts/setup-tunnel.sh your-tunnel-domain.example.com
```

Then restart `npm start` — env vars are only read at boot, and a `.env.dev`/Vite config change isn't something the (already-unreliable, see above) file watcher would pick up regardless. The script is safe to re-run (e.g. against a new tunnel domain next session).

What it does, if you'd rather make the edits by hand or are debugging why something's still not working:

1. **`.env.dev`** — set `AP_FRONTEND_URL` to `https://your-tunnel-domain`, so Activepieces generates webhook URLs pointing at it instead of `localhost`.
2. **`packages/web/vite.config.mts`** — set `server.allowedHosts` to `['your-tunnel-domain']` (Vite's dev server rejects requests whose `Host` header isn't in this list; the file ships with this commented out). Note this file moved from `.ts` to `.mts` at some point upstream, if you're following older docs/screenshots that mention `.ts`.
3. **`packages/web/vite.config.mts`** — set `server.hmr` to `{ protocol: 'wss', clientPort: 443 }`. Without this, Vite's injected HMR client tries to open its websocket directly against `ws://localhost:4200`, which an HTTPS-loaded page blocks as mixed content — symptom is a reload loop once you open the tunnel URL.

These are edits to the *cloned Activepieces checkout* (`~/activepieces`), not to this repo, so they aren't committed anywhere and won't survive a container rebuild — that's exactly why the script exists, so reapplying them is a one-liner instead of hunting this section down again.

## References

- [FreeScout API docs](https://api-docs.freescout.net/)
- [Activepieces piece-building docs](https://www.activepieces.com/docs/developers)

## License

[Apache License 2.0](LICENSE)
