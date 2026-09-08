import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { freescoutAuth } from '../common/auth';
import { freescoutApiCall, stripEmpty } from '../common/client';

export const updateCustomer = createAction({
  auth: freescoutAuth,
  name: 'update_customer',
  displayName: 'Update Customer',
  description: 'Updates an existing customer by ID.',
  props: {
    customerId: Property.Number({
      displayName: 'Customer ID',
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
    addEmail: Property.ShortText({
      displayName: 'Add Email',
      description: 'Adds an additional email address to this customer without removing existing ones.',
      required: false,
    }),
  },
  async run(context) {
    const { customerId, firstName, lastName, phone, company, jobTitle, notes, addEmail } =
      context.propsValue;

    const body = stripEmpty({
      firstName,
      lastName,
      phone,
      company,
      jobTitle,
      notes,
      emails_add: addEmail ? [addEmail] : undefined,
    });

    if (Object.keys(body).length === 0) {
      throw new Error('Provide at least one field to update.');
    }

    await freescoutApiCall({
      auth: context.auth.props,
      method: HttpMethod.PUT,
      resourceUri: `/customers/${customerId}`,
      body,
    });

    return {
      success: true,
      customerId,
    };
  },
});
