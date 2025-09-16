import { z } from "zod";

// Basic GeoJSON structure validation
const geoJSONSchema = z.object({
  type: z.string(),
  coordinates: z.array(z.any()),
});

export const createDistrictSchema = z.object({
  body: z.object({
    name: z.string().min(1, "District name is required"),
    code: z.string().optional(),
    stateId: z.string().uuid("Invalid state UUID"),
    boundary: z.string(), // Expecting a GeoJSON string
  }),
});

export const updateDistrictSchema = z.object({
  body: z.object({
    name: z.string().min(1, "District name is required").optional(),
    code: z.string().optional(),
    stateId: z.string().uuid("Invalid state UUID").optional(),
    boundary: z.string().optional(), // Expecting a GeoJSON string
  }),
  params: z.object({
    id: z.string().uuid("Invalid UUID"),
  }),
});
