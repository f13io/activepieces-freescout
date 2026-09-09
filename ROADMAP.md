# Roadmap

Candidate features for this piece, based on what the [FreeScout API](https://api-docs.freescout.net/)
supports versus what's built so far. Not commitments or a schedule — a prioritized list to work
through opportunistically. See `README.md` for what's actually shipped today.

Suggested order below front-loads cheap, high-value wins (more webhook triggers via the existing
factory) before the two items that need new infrastructure (attachments, polling).

## 1. More webhook triggers

All of these reuse `createFreescoutWebhookTrigger` in `src/lib/common/webhook-trigger-factory.ts`
— each is a few lines, same shape as the two that already exist (`New Conversation`,
`New Customer Reply`). Full list of FreeScout webhook events, in suggested build order:

1. **Conversation Status Changed** (`convo.status`) — fires when a conversation is closed,
   reopened, etc. Enables CSAT-survey-on-close flows, SLA/time-to-close tracking.
2. **New Agent Reply** (`convo.agent.reply.created`) — fires when an agent replies. Useful for
   mirroring agent activity to Slack or an external system.
3. **New Note** (`convo.note.created`) — fires on internal notes. Useful for syncing internal
   context to another tool without exposing it to the customer.
4. **Conversation Assigned** (`convo.assigned`) — fires on assignment change. Notify the assignee
   elsewhere, or keep an external ticket's "owner" field in sync.
5. **New/Updated Customer** (`customer.created`, `customer.updated`) — two triggers, likely built
   together. CRM sync is the obvious use case.
6. **Conversation Moved** (`convo.moved`) — fires on mailbox change. Useful for mailbox-based
   routing automations.
7. **Conversation Deleted** (`convo.deleted`) — lowest priority of the set; cleanup automations
   are a narrower use case than the others here.

## 2. Add Attachment to Thread (action)

Extends the existing `create_thread` action, which currently has no attachment support.
FreeScout accepts attachments as base64 `data` or a `fileUrl` per attachment. "Reply with a
generated file attached" is a common automation shape (e.g. attach a generated PDF/CSV to a
reply), so this is a real functionality gap rather than a nice-to-have.

**Needs new infrastructure**: this piece doesn't handle binary/file props (`Property.File`)
anywhere yet — this would be the first action to need that, including base64-encoding the file
content into the request body.

## 3. Polling trigger support

FreeScout instances that can't expose a public webhook URL (no tunnel, no reverse proxy, closed
network) currently can't use this piece's triggers at all, since both existing triggers are
webhook-based. FreeScout's list-conversations endpoint supports `createdSince`/`updatedSince`
filters, which map cleanly onto Activepieces' [polling-trigger helper](https://www.activepieces.com/docs/build-pieces/piece-reference/triggers/polling-trigger).

**Needs new infrastructure**: no polling trigger exists in this piece yet — this establishes the
pattern, distinct from the webhook-trigger factory. Once built, it's a reasonable fallback/
alternative for any of the events in section 1, not just conversation-created.

## 4. List/Search Conversations (action)

Filterable by mailbox, folder, status, tag, customer email, and date range. Useful standalone
(e.g. "did this customer already have an open conversation") or as a data source feeding a loop
step in a flow.

**Moderate complexity**: needs dropdown props for mailbox and folder (see section 5 — worth
sequencing after the dropdown-prop helpers below so this action can reuse them).

## 5. Reusable dropdown props: mailboxes, folders, tags

Not standalone actions on their own — these are `List Mailboxes` / `List Folders` / `List Tags`
API calls wrapped as reusable Activepieces dropdown props, used to power selection fields in
other actions (section 4's mailbox/folder filters, a tag-picker for `Update Conversation Tags`,
etc.). Worth building before or alongside section 4 rather than after, since it directly
improves that action's UX instead of shipping a raw ID text field first.

## 6. Get Conversation / Delete Conversation (actions)

Straightforward, same shape as existing single-resource actions (`Find Customer by Email`,
`Update Customer`). Rounds out basic conversation CRUD.

## 7. Update Custom Fields (conversation and/or customer)

Only relevant for FreeScout instances that actually use custom fields, so lower priority unless
requested. **Needs new infrastructure**: field sets vary per mailbox/instance, so this likely
needs a dynamic-props refresher (fetch the field definitions live, populate the input form)
rather than a static prop list.

## Lower priority / not currently planned

- **Create/Get/List/Delete User** (agent management) — rarer in automation contexts than
  customer/conversation actions.
- **Time logs, reports endpoints** — niche; not speced out, revisit only if a concrete use case
  comes up.
