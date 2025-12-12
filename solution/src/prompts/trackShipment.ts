import { z } from 'zod';

const inputSchema = z.object({
  reference: z.string().nonempty('Reference is required')
});

type Input = z.infer<typeof inputSchema>;

export const trackShipmentPrompt = {
  name: 'track-shipment',
  config: {
    title: 'Track Shipment',
    description: 'Prompt to fetch and summarize a DB Schenker shipment by reference.',
    argsSchema: inputSchema.shape
  },
  handler: async ({ reference }: Input) => {
    return {
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Fetch DB Schenker shipment for reference ${reference} using the track-shipment tool, then summarize sender, receiver, packages, and latest events.`
          }
        }
      ]
    };
  }
};
