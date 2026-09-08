import { createPiece } from '@activepieces/pieces-framework';
import { freescoutAuth } from './lib/common/auth';
import { createConversation } from './lib/actions/create-conversation';
import { createThread } from './lib/actions/create-thread';
import { createCustomer } from './lib/actions/create-customer';
import { updateCustomer } from './lib/actions/update-customer';
import { findCustomer } from './lib/actions/find-customer';
import { freescoutCustomApiCall } from './lib/actions/custom-api-call';

export const freescout = createPiece({
  displayName: 'FreeScout',
  description: 'Self-hosted help desk and shared mailbox.',
  auth: freescoutAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.jsdelivr.net/gh/selfhst/icons@main/png/freescout.png',
  authors: [],
  actions: [
    findCustomer,
    createCustomer,
    updateCustomer,
    createConversation,
    createThread,
    freescoutCustomApiCall,
  ],
  triggers: [],
});
