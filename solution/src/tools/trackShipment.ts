import { z } from 'zod';
import { fetchShipment } from '@/lib/dbschenker/index.js';
import { createShipmentSummary, shipmentSummarySchema } from '@/schemas.js';

const inputSchema = z.object({
  reference: z.string().nonempty('Reference number is required.')
});
type Input = z.infer<typeof inputSchema>;

export const trackShipmentTool = {
  name: 'track-shipment',
  config: {
    title: 'Track Shipment',
    description: 'Fetch DB Schenker shipment details by reference number.',
    inputSchema: inputSchema,
    outputSchema: shipmentSummarySchema
  },
  handler: async (input: Input) => {
    try {
      const apiShipment = await fetchShipment(input.reference);
      const shipment = createShipmentSummary(apiShipment, input.reference);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(shipment, null, 2)
          }
        ],
        structuredContent: shipment
      };
    } catch (err) {
      // Surface a user-friendly error instead of throwing to the client.
      const message = err instanceof Error ? err.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text' as const,
            text: `Failed to track shipment: ${message}`
          }
        ],
        structuredContent: { error: message }
      };
    }
  }
};
