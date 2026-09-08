import { createFreescoutWebhookTrigger } from '../common/webhook-trigger-factory';
import { SAMPLE_CONVERSATION } from '../common/sample-data';

export const newConversation = createFreescoutWebhookTrigger({
  name: 'new_conversation',
  displayName: 'New Conversation',
  description: 'Triggers when a new conversation is created.',
  event: 'convo.created',
  sampleData: SAMPLE_CONVERSATION,
});
