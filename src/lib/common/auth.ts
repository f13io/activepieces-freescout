import { PieceAuth, Property } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';

export const freescoutAuth = PieceAuth.CustomAuth({
  displayName: 'FreeScout Connection',
  description:
    'Requires the "API & Webhooks" module to be installed on your FreeScout instance. Find your API key under Manage » API & Webhooks.',
  props: {
    baseUrl: Property.ShortText({
      displayName: 'FreeScout URL',
      description: 'e.g. https://tickets.example.com',
      required: true,
    }),
    apiKey: PieceAuth.SecretText({
      displayName: 'API Key',
      required: true,
    }),
    webhookSigningKey: PieceAuth.SecretText({
      displayName: 'Webhook Signing Key',
      description:
        'Optional. Find it under Manage » Settings » API & Webhooks ("Secret Key"). When set, incoming webhooks are verified against their X-FreeScout-Signature header, and anything that fails verification is silently dropped instead of triggering a flow. Leave blank to skip verification and accept all deliveries.',
      required: false,
    }),
  },
  validate: async ({ auth }) => {
    try {
      await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${auth.baseUrl.replace(/\/+$/, '')}/api/mailboxes`,
        headers: {
          'X-FreeScout-API-Key': auth.apiKey,
        },
      });
      return { valid: true };
    } catch (e) {
      return {
        valid: false,
        error: 'Could not connect to FreeScout. Check the URL and API key.',
      };
    }
  },
  required: true,
});
