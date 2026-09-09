# Changelog

All notable changes to this piece are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows the rules in
Activepieces' [piece versioning docs](https://www.activepieces.com/docs/build-pieces/piece-reference/piece-versioning)
(semver, as it applies to a piece's actions/triggers/props).

Each release's heading (`## [x.y.z] - YYYY-MM-DD`) must match the version in `package.json` at
the commit that ships it — the publish workflow checks this and fails if they disagree.

## [Unreleased]

## [0.2.0] - 2026-09-08

### Added

- Action: Update Conversation Tags — replaces a conversation's tags (not additive). Requires the
  [Tags](https://freescout.net/module/tags/) module on the FreeScout instance.

## [0.1.1] - 2026-09-08

No functional changes. Test release to verify the npm Trusted Publishing pipeline
(`.github/workflows/publish-piece.yml`) end-to-end after the manual bootstrap publish of 0.1.0.

## [0.1.0] - 2026-09-08

Initial release.

### Added

- Auth: FreeScout instance URL + API key.
- Actions: Find Customer by Email, Create Customer, Update Customer, Create Conversation,
  Create Thread (Reply/Note), Custom API Call.
- Triggers (webhook-based): New Conversation, New Customer Reply.
