import { createFreescoutWebhookTrigger } from '../common/webhook-trigger-factory';
import { SAMPLE_CONVERSATION } from '../common/sample-data';

export const newCustomerReply = createFreescoutWebhookTrigger({
  name: 'new_customer_reply',
  displayName: 'New Customer Reply',
  description: 'Triggers when a customer replies to a conversation.',
  event: 'convo.customer.reply.created',
  sampleData: SAMPLE_CONVERSATION,
});
