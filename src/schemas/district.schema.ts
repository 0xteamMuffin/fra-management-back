import { z } from "zod";

const geoJSONSchema = z.object({
  type: z.string(),
  coordinates: z.array(z.any()),
});

export const createDistrictSchema = z.object({
  body: z.object({
    name: z.string().min(1, "District name is required"),
    code: z.string().optional(),
    stateId: z.string().uuid("Invalid state UUID"),
    boundary: z.string(),
  }),
});

export const updateDistrictSchema = z.object({
  body: z.object({
    name: z.string().min(1, "District name is required").optional(),
    code: z.string().optional(),
    stateId: z.string().uuid("Invalid state UUID").optional(),
    boundary: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid UUID"),
  }),
});
