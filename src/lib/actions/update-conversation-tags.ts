import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { freescoutAuth } from '../common/auth';
import { freescoutApiCall } from '../common/client';

export const updateConversationTags = createAction({
  auth: freescoutAuth,
  name: 'update_conversation_tags',
  displayName: 'Update Conversation Tags',
  description:
    'Replaces all tags on a conversation with the given list — not additive, so omitting an existing tag removes it. Unknown tag names are created automatically. Send an empty list to clear all tags. Requires the Tags module installed on the FreeScout instance.',
  props: {
    conversationId: Property.Number({
      displayName: 'Conversation ID',
      description: 'The numeric ID of the conversation (visible in its FreeScout URL).',
      required: true,
    }),
    tags: Property.Array({
      displayName: 'Tags',
      description: 'Full list of tag names the conversation should have.',
      required: true,
    }),
  },
  async run(context) {
    const { conversationId, tags } = context.propsValue;

    await freescoutApiCall({
      auth: context.auth.props,
      method: HttpMethod.PUT,
      resourceUri: `/conversations/${conversationId}/tags`,
      body: { tags },
    });

    return {
      conversationId,
      tags,
    };
  },
});
