// FreeScout's API docs don't document the actual webhook delivery payload
// shape (only the subscription-management endpoints), so this is a
// best-effort approximation based on the documented Conversation resource.
// It only drives the flow builder's "sample data" preview — the real
// runtime payload always comes through as-is from context.payload.body.
export const SAMPLE_CONVERSATION = {
  id: 123,
  number: 45,
  type: 'email',
  subject: 'Sample support request',
  status: 'active',
  state: 'published',
  mailboxId: 1,
  customer: {
    id: 67,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
  },
  createdAt: '2026-01-01T12:00:00Z',
  updatedAt: '2026-01-01T12:00:00Z',
};
