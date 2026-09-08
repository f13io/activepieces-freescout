import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { freescoutAuth } from '../common/auth';
import { freescoutApiCall, getResourceId, stripEmpty } from '../common/client';

export const createCustomer = createAction({
  auth: freescoutAuth,
  name: 'create_customer',
  displayName: 'Create Customer',
  description: 'Creates a new customer. Does not update an existing customer — if the email already exists, no customer is created.',
  props: {
    email: Property.ShortText({
      displayName: 'Email',
      required: true,
    }),
    firstName: Property.ShortText({
      displayName: 'First Name',
      required: false,
    }),
    lastName: Property.ShortText({
      displayName: 'Last Name',
      required: false,
    }),
    phone: Property.ShortText({
      displayName: 'Phone',
      required: false,
    }),
    company: Property.ShortText({
      displayName: 'Company',
      required: false,
    }),
    jobTitle: Property.ShortText({
      displayName: 'Job Title',
      required: false,
    }),
    notes: Property.LongText({
      displayName: 'Notes',
      required: false,
    }),
  },
  async run(context) {
    const { email, firstName, lastName, phone, company, jobTitle, notes } = context.propsValue;

    const body = stripEmpty({
      firstName,
      lastName,
      phone,
      company,
      jobTitle,
      notes,
      emails: [{ value: email, type: 'work' }],
    });

    const response = await freescoutApiCall({
      auth: context.auth.props,
      method: HttpMethod.POST,
      resourceUri: '/customers',
      body,
    });

    return {
      customerId: getResourceId(response),
      email,
    };
  },
});
