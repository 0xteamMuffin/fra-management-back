import { z } from "zod";

export const createVillageSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Village name is required"),
    districtId: z.string().uuid("Invalid district UUID"),
    coordinates: z.string(), // Expecting a GeoJSON string for a Point
    boundary: z.string().optional(), // Expecting a GeoJSON string for a Polygon
  }),
});

export const updateVillageSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Village name is required").optional(),
    districtId: z.string().uuid("Invalid district UUID").optional(),
    coordinates: z.string().optional(),
    boundary: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid UUID"),
  }),
});
