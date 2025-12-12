import { z } from 'zod';

const locationSchema = z.object({
  countryCode: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  postCode: z.string().optional(),
  name: z.string().optional(),
  code: z.string().optional()
});

const referenceEntrySchema = z.object({
  referenceType: z.enum([
    'Stt',
    'WaybillNo',
    'ShippersRefNo',
    'PackageId',
    'ConsigneesRefNo',
    'Hawb',
    'BookingId',
    'CustomerBookingRef',
    'PurchaseOrderNo',
    'Hbl',
    'ContainerNo',
    'ATOL',
    'COS',
    'ShippingOrderNumber',
    'MovementReferenceNumber',
    'ShipmentNoExportImport',
    'SalesOrderNumber',
    'DeliveryOrderNumber',
    'PackageNumber',
    'AssetId',
    'JobId'
  ]),
  value: z.string().optional(),
  allowedPattern: z.string().optional()
});

export const valueWithUnitSchema = z.object({
  value: z.number(),
  unit: z.string()
});

const referencesSchema = z.object({
  shipper: z.array(z.string()).optional(),
  consignee: z.array(z.string()).optional(),
  waybillAndConsignementNumbers: z.array(z.string()).optional(),
  additionalReferences: z
    .array(z.union([referenceEntrySchema, z.string(), z.unknown()]))
    .optional(),
  originalStt: z.string().nullable().optional()
});

const goodsSchema = z.object({
  pieces: z.number().optional(),
  volume: valueWithUnitSchema.optional(),
  weight: valueWithUnitSchema.optional(),
  dimensions: z.array(z.unknown()).optional(),
  loadingMeters: valueWithUnitSchema.optional(),
  stackable: z.boolean().nullable().optional(),
  chargeableWeight: z.unknown().nullable().optional(),
  agreementDangerousRoad: z.unknown().nullable().optional(),
  customsDuty: z.unknown().nullable().optional()
});

export const eventSchema = z.object({
  code: z.string().optional(),
  date: z.iso.datetime().optional(),
  createdAt: z.iso.datetime().optional(),
  location: locationSchema.optional(),
  comment: z.string().nullable().optional(),
  recipient: z.unknown().nullable().optional(),
  reasons: z
    .array(
      z.object({
        code: z.string().optional(),
        description: z.string().optional()
      })
    )
    .optional(),
  shellIconName: z.string().nullable().optional()
});

const packageEventsSchema = z.object({
  code: z.string().optional(),
  date: z.iso.datetime().optional(),
  countryCode: z.string().optional(),
  location: z.string().optional()
});

const packageSchema = z.object({
  id: z.string(),
  events: z.array(packageEventsSchema).optional()
});

export const shipmentResponseSchema = z
  .object({
    sttNumber: z.string().optional(),
    references: referencesSchema.optional(),
    goods: goodsSchema.optional(),
    events: z.array(eventSchema).optional(),
    packages: z.array(packageSchema).optional(),
    product: z.string().optional(),
    service: z.unknown().nullable().optional(),
    services: z.array(z.unknown()).optional(),
    deliveryDate: z
      .object({
        estimated: z.iso.datetime().nullable().optional(),
        agreed: z.iso.datetime().nullable().optional()
      })
      .optional(),
    combiterms: z.unknown().nullable().optional(),
    transportMode: z.string().optional(),
    progressBar: z
      .object({
        steps: z.array(z.string()).optional(),
        activeStep: z.string().optional()
      })
      .optional(),
    location: z
      .object({
        collectFrom: locationSchema.optional(),
        deliverTo: locationSchema.optional(),
        shipperPlace: locationSchema.optional(),
        consigneePlace: locationSchema.optional(),
        dispatchingOffice: locationSchema.optional(),
        receivingOffice: locationSchema.optional()
      })
      .optional(),
    transportUnits: z.unknown().nullable().optional()
  })
  .loose();

export type ShipmentResponse = z.infer<typeof shipmentResponseSchema>;
