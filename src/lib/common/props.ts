import { CustomAuthConnectionValue, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { freescoutAuth } from './auth';
import { freescoutApiCall, FreescoutAuthProps } from './client';

type UserListResponse = {
  _embedded: {
    users: { id: number; firstName: string; lastName: string; email: string }[];
  };
};

export const userIdDropdown = <R extends boolean>(params: {
  displayName: string;
  description?: string;
  required: R;
}) =>
  Property.Dropdown({
    displayName: params.displayName,
    description: params.description,
    required: params.required,
    auth: freescoutAuth,
    refreshers: ['auth'],
    options: async ({ auth }) => {
      if (!auth) {
        return {
          disabled: true,
          options: [],
          placeholder: 'Connect your FreeScout account first',
        };
      }
      const typedAuth = (auth as CustomAuthConnectionValue<FreescoutAuthProps>).props;
      const response = await freescoutApiCall<UserListResponse>({
        auth: typedAuth,
        method: HttpMethod.GET,
        resourceUri: '/users',
        query: { pageSize: 100 },
      });
      return {
        options: response.body._embedded.users.map((user) => ({
          label: `${user.firstName} ${user.lastName} (${user.email})`,
          value: user.id,
        })),
      };
    },
  });
