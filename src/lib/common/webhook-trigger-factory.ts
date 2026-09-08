import { createTrigger, TriggerStrategy } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { freescoutAuth } from './auth';
import { freescoutApiCall, getResourceId } from './client';

export function createFreescoutWebhookTrigger(params: {
  name: string;
  displayName: string;
  description: string;
  event: string;
  sampleData: Record<string, unknown>;
}) {
  return createTrigger({
    auth: freescoutAuth,
    name: params.name,
    displayName: params.displayName,
    description: params.description,
    type: TriggerStrategy.WEBHOOK,
    props: {},
    sampleData: params.sampleData,
    async onEnable(context) {
      const response = await freescoutApiCall({
        auth: context.auth.props,
        method: HttpMethod.POST,
        resourceUri: '/webhooks',
        body: {
          url: context.webhookUrl,
          events: [params.event],
        },
      });
      await context.store.put('webhookId', getResourceId(response));
    },
    async onDisable(context) {
      const webhookId = await context.store.get('webhookId');
      if (webhookId) {
        await freescoutApiCall({
          auth: context.auth.props,
          method: HttpMethod.DELETE,
          resourceUri: `/webhooks/${webhookId}`,
        });
      }
    },
    async run(context) {
      return [context.payload.body];
    },
  });
}
