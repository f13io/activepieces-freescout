import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { freescoutAuth } from '../common/auth';
import { buildCustomerRef, freescoutApiCall, getResourceId, stripEmpty } from '../common/client';
import { userIdDropdown } from '../common/props';

export const createThread = createAction({
  auth: freescoutAuth,
  name: 'create_thread',
  displayName: 'Create Thread (Reply / Note)',
  description: 'Add a customer reply, agent reply, or internal note to a conversation.',
  props: {
    conversationId: Property.Number({
      displayName: 'Conversation ID',
      description: 'The numeric ID of the conversation (visible in its FreeScout URL).',
      required: true,
    }),
    type: Property.StaticDropdown({
      displayName: 'Thread Type',
      required: true,
      options: {
        options: [
          { label: 'Reply as Agent', value: 'message' },
          { label: 'Internal Note', value: 'note' },
          { label: 'Reply as Customer', value: 'customer' },
        ],
      },
    }),
    text: Property.LongText({
      displayName: 'Message',
      required: true,
    }),
    userId: userIdDropdown({
      displayName: 'Agent',
      description: 'Required for "Reply as Agent" and "Internal Note" — the FreeScout agent adding this thread.',
      required: false,
    }),
    customerId: Property.Number({
      displayName: 'Customer ID',
      description:
        'For "Reply as Customer": link to a known customer (e.g. from "Find Customer by Email" or "Create Customer"). Takes priority over Customer Email.',
      required: false,
    }),
    customerEmail: Property.ShortText({
      displayName: 'Customer Email',
      description: 'For "Reply as Customer", used only if Customer ID is not provided. Looks up the customer by email, or creates one if no match exists.',
      required: false,
    }),
    status: Property.StaticDropdown({
      displayName: 'Set Conversation Status',
      description: 'Leave blank to use FreeScout\'s default behavior (customer reply reactivates, agent reply sets pending).',
      required: false,
      options: {
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Pending', value: 'pending' },
          { label: 'Closed', value: 'closed' },
        ],
      },
    }),
  },
  async run(context) {
    const { conversationId, type, text, userId, customerId, customerEmail, status } = context.propsValue;

    if (type === 'customer' && !customerId && !customerEmail) {
      throw new Error('Provide either a Customer ID or a Customer Email when replying as the customer.');
    }
    if ((type === 'message' || type === 'note') && !userId) {
      throw new Error('Agent is required for agent replies and internal notes.');
    }

    const body = stripEmpty({
      type,
      text,
      status,
      user: type !== 'customer' ? userId : undefined,
      customer: type === 'customer' ? buildCustomerRef({ customerId, email: customerEmail }) : undefined,
    });

    const response = await freescoutApiCall({
      auth: context.auth.props,
      method: HttpMethod.POST,
      resourceUri: `/conversations/${conversationId}/threads`,
      body,
    });

    return {
      threadId: getResourceId(response),
      conversationId,
    };
  },
});
