import { z } from 'zod';
import { eventSchema, ShipmentResponse, valueWithUnitSchema } from '@/lib/dbschenker/schemas.js';

export const partySchema = z.object({
  reference: z.string(),
  location: z.string().optional()
});
export type Party = z.infer<typeof partySchema>;

export const packageDetailsSchema = z.object({
  id: z.string()
  // weight: valueWithUnitSchema.optional(),
  // dimensions: z.unknown().optional()
});
export type PackageDetails = z.infer<typeof packageDetailsSchema>;

export const shipmentSummarySchema = z.object({
  reference: z.string(),
  sender: partySchema,
  receiver: partySchema,
  goods: z.object({
    pieces: z.number(),
    totalVolume: valueWithUnitSchema,
    totalWeight: valueWithUnitSchema,
    dimensions: z.array(z.unknown()),
    packages: z.array(packageDetailsSchema)
  }),
  events: z.array(eventSchema).optional()
});
export type ShipmentSummary = z.infer<typeof shipmentSummarySchema>;

export function createShipmentSummary(shipment: ShipmentResponse, reference: string) {
  const sender = partySchema.parse({
    reference: shipment.references?.shipper?.[0] ?? 'Unknown',
    location: formatAddress(shipment.location?.shipperPlace ?? shipment.location?.collectFrom)
  });

  const receiver = partySchema.parse({
    reference: shipment.references?.consignee?.[0] ?? 'Unknown',
    location: formatAddress(shipment.location?.consigneePlace ?? shipment.location?.deliverTo)
  });

  const goods = {
    pieces: shipment.goods?.pieces ?? shipment.packages?.length ?? 0,
    totalVolume: shipment.goods?.volume ?? {
      value: 0,
      unit: 'UNKNOWN'
    },
    totalWeight: shipment.goods?.weight ?? {
      value: 0,
      unit: 'UNKNOWN'
    },
    dimensions: shipment.goods?.dimensions ?? [],
    packages: shipment.packages ?? []
  };

  const events = shipment.events ?? [];

  return shipmentSummarySchema.parse({
    reference,
    sender,
    receiver,
    goods,
    events
  });
}

function formatAddress(location?: any) {
  const addressParts = [
    location?.city,
    location?.postCode,
    location?.countryCode,
    location?.country
  ].filter(Boolean);
  return addressParts.length ? addressParts.join(', ') : undefined;
}
