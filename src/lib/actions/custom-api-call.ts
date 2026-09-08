import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { CustomAuthConnectionValue } from '@activepieces/pieces-framework';
import { freescoutAuth } from '../common/auth';
import { FreescoutAuthProps } from '../common/client';

export const freescoutCustomApiCall = createCustomApiCallAction({
  auth: freescoutAuth,
  baseUrl: (auth) =>
    `${(auth as CustomAuthConnectionValue<FreescoutAuthProps>).props.baseUrl.replace(/\/+$/, '')}/api`,
  authMapping: async (auth) => {
    const typedAuth = auth as CustomAuthConnectionValue<FreescoutAuthProps>;
    return {
      'X-FreeScout-API-Key': typedAuth.props.apiKey,
    };
  },
});
