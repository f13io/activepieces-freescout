import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { freescoutAuth } from '../common/auth';
import { freescoutApiCall } from '../common/client';

type CustomerRecord = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  jobTitle: string | null;
};

type CustomerListResponse = {
  _embedded: {
    customers: CustomerRecord[];
  };
};

export const findCustomer = createAction({
  auth: freescoutAuth,
  name: 'find_customer_by_email',
  displayName: 'Find Customer by Email',
  description:
    'Looks up an existing customer by email address. Returns "found: false" if no match exists, so you can branch your flow (e.g. before calling "Create Customer").',
  props: {
    email: Property.ShortText({
      displayName: 'Email',
      required: true,
    }),
  },
  async run(context) {
    const { email } = context.propsValue;

    const response = await freescoutApiCall<CustomerListResponse>({
      auth: context.auth.props,
      method: HttpMethod.GET,
      resourceUri: '/customers',
      query: { email },
    });

    const customer = response.body._embedded?.customers?.[0];

    if (!customer) {
      return {
        found: false,
        customerId: undefined,
      };
    }

    return {
      found: true,
      customerId: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      company: customer.company,
      jobTitle: customer.jobTitle,
    };
  },
});
