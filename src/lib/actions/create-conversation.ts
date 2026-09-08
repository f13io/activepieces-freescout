import { createAction, CustomAuthConnectionValue, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { freescoutAuth } from '../common/auth';
import { buildCustomerRef, freescoutApiCall, getResourceId, stripEmpty, FreescoutAuthProps } from '../common/client';
import { userIdDropdown } from '../common/props';

type MailboxListResponse = {
  _embedded: {
    mailboxes: { id: number; name: string }[];
  };
};

export const createConversation = createAction({
  auth: freescoutAuth,
  name: 'create_conversation',
  displayName: 'Create Conversation',
  description: 'Starts a new conversation in a mailbox with an initial agent message or note.',
  props: {
    mailboxId: Property.Dropdown({
      displayName: 'Mailbox',
      required: true,
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
        const response = await freescoutApiCall<MailboxListResponse>({
          auth: typedAuth,
          method: HttpMethod.GET,
          resourceUri: '/mailboxes',
        });
        return {
          options: response.body._embedded.mailboxes.map((mailbox) => ({
            label: mailbox.name,
            value: mailbox.id,
          })),
        };
      },
    }),
    subject: Property.ShortText({
      displayName: 'Subject',
      required: true,
    }),
    type: Property.StaticDropdown({
      displayName: 'Conversation Type',
      required: true,
      defaultValue: 'email',
      options: {
        options: [
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' },
          { label: 'Chat', value: 'chat' },
        ],
      },
    }),
    customerId: Property.Number({
      displayName: 'Customer ID',
      description:
        'Link this conversation to a known customer (e.g. from "Find Customer by Email" or "Create Customer"). Takes priority over Customer Email — use this whenever you already know the customer, since matching by email alone ignores name/company on an existing record.',
      required: false,
    }),
    customerEmail: Property.ShortText({
      displayName: 'Customer Email',
      description: 'Used only if Customer ID is not provided. Looks up (or creates) a customer by email.',
      required: false,
    }),
    customerFirstName: Property.ShortText({
      displayName: 'Customer First Name',
      description: 'Used only if Customer ID is not provided.',
      required: false,
    }),
    threadType: Property.StaticDropdown({
      displayName: 'Initial Thread Type',
      required: true,
      defaultValue: 'customer',
      options: {
        options: [
          { label: 'Message From Customer', value: 'customer' },
          { label: 'Reply as Agent', value: 'message' },
          { label: 'Internal Note', value: 'note' },
        ],
      },
    }),
    text: Property.LongText({
      displayName: 'Message',
      required: true,
    }),
    userId: userIdDropdown({
      displayName: 'Agent',
      description: 'Required for "Reply as Agent" and "Internal Note" — the FreeScout agent adding the initial thread.',
      required: false,
    }),
    assignTo: userIdDropdown({
      displayName: 'Assign To',
      required: false,
    }),
    status: Property.StaticDropdown({
      displayName: 'Status',
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
    const {
      mailboxId,
      subject,
      type,
      customerId,
      customerEmail,
      customerFirstName,
      threadType,
      text,
      userId,
      assignTo,
      status,
    } = context.propsValue;

    if ((threadType === 'message' || threadType === 'note') && !userId) {
      throw new Error('Agent is required when the initial thread is an agent reply or internal note.');
    }
    if (!customerId && !customerEmail) {
      throw new Error('Provide either a Customer ID or a Customer Email.');
    }

    const customer = buildCustomerRef({ customerId, email: customerEmail, firstName: customerFirstName });

    const body = stripEmpty({
      type,
      mailboxId,
      subject,
      status,
      assignTo,
      customer,
      threads: [
        stripEmpty({
          type: threadType,
          text,
          user: threadType !== 'customer' ? userId : undefined,
          customer: threadType === 'customer' ? customer : undefined,
        }),
      ],
    });

    const response = await freescoutApiCall({
      auth: context.auth.props,
      method: HttpMethod.POST,
      resourceUri: '/conversations',
      body,
    });

    return {
      conversationId: getResourceId(response),
    };
  },
});
